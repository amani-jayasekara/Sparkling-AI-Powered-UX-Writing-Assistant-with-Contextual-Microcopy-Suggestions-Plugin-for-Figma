from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from prompts.microcopyPrompt import build_prompt


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Sparkling UX AI Backend",
    description="AI-powered UX Microcopy Generation Backend",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request Model
# ============================================================

class MicrocopyRequest(BaseModel):
    uiContext: str
    intent: str
    tone: str
    persona: str

    # Used during regeneration
    previous_suggestions: list[str] = Field(default_factory=list)


# ============================================================
# Helper Functions
# ============================================================

def clean_text(text: str) -> str:
    """
    Clean generated microcopy.
    """

    text = text.strip()

    # Remove unnecessary quotation marks
    text = text.strip('"').strip("'")

    # Keep microcopy short
    if len(text) > 80:
        text = text[:77].rstrip() + "..."

    return text


def normalize_tone(tone: str) -> str:
    """
    Normalize tone value.
    """

    return tone.strip().lower()


# ============================================================
# Tone-Based Suggestion Generator
# ============================================================

def generate_login_suggestions(intent, tone):

    tone = normalize_tone(tone)

    # --------------------------------------------------------
    # USER LOGIN
    # --------------------------------------------------------

    if intent == "User Login":

        tone_suggestions = {

            "friendly": [
                "Welcome back! Ready to sign in?",
                "Good to see you! Sign in to continue.",
                "Welcome back! Let's get you signed in."
            ],

            "professional": [
                "Sign in to access your account.",
                "Please sign in to continue.",
                "Enter your details to access your account."
            ],

            "casual": [
                "Ready to log in? Let's go!",
                "Jump back in and sign in.",
                "Log in and pick up where you left off."
            ],

            "helpful": [
                "Sign in to continue to your account.",
                "Enter your details to sign in securely.",
                "Sign in to access your account and continue."
            ],

            "simple": [
                "Sign in to your account.",
                "Log in to continue.",
                "Enter your details to sign in."
            ]
        }

        return tone_suggestions.get(
            tone,
            tone_suggestions["friendly"]
        )

    # --------------------------------------------------------
    # CREATE ACCOUNT
    # --------------------------------------------------------

    if intent == "Create Account":

        tone_suggestions = {

            "friendly": [
                "New here? Create your account to get started.",
                "Welcome! Create your account to begin.",
                "Let's get you started with a new account."
            ],

            "professional": [
                "Create your account to continue.",
                "Register your account to get started.",
                "Complete your registration to continue."
            ],

            "casual": [
                "New here? Let's make an account!",
                "Ready to join? Sign up now.",
                "Create an account and jump right in."
            ],

            "helpful": [
                "Create an account to continue.",
                "Sign up to get access to your account.",
                "Enter your details to create an account."
            ],

            "simple": [
                "Create your account.",
                "Sign up to continue.",
                "Make an account to get started."
            ]
        }

        return tone_suggestions.get(
            tone,
            tone_suggestions["friendly"]
        )

    # --------------------------------------------------------
    # GET STARTED
    # --------------------------------------------------------

    if intent == "Get Started":

        tone_suggestions = {

            "friendly": [
                "Ready to get started?",
                "Welcome! Let's get started.",
                "You're ready to begin!"
            ],

            "professional": [
                "Get started to continue.",
                "Begin by continuing to the next step.",
                "Proceed to get started."
            ],

            "casual": [
                "Ready? Let's get going!",
                "Let's jump right in.",
                "Let's get started!"
            ],

            "helpful": [
                "Choose an option to get started.",
                "Continue to begin using your account.",
                "Follow the next step to get started."
            ],

            "simple": [
                "Get started.",
                "Start now.",
                "Continue to begin."
            ]
        }

        return tone_suggestions.get(
            tone,
            tone_suggestions["friendly"]
        )

    # --------------------------------------------------------
    # SHOW ERROR
    # --------------------------------------------------------

    if intent == "Show Error":

        tone_suggestions = {

            "friendly": [
                "We couldn't sign you in. Let's try again.",
                "Oops! Something went wrong. Please try again.",
                "Sorry, we couldn't sign you in."
            ],

            "professional": [
                "We could not sign you in. Please try again.",
                "Sign-in was unsuccessful. Please try again.",
                "We could not complete your sign-in."
            ],

            "casual": [
                "Oops! That didn't work. Try again.",
                "Looks like something went wrong. Try again.",
                "We couldn't log you in. Give it another try."
            ],

            "helpful": [
                "We couldn't sign you in. Check your details and try again.",
                "Please check your login details and try again.",
                "Make sure your details are correct, then try again."
            ],

            "simple": [
                "Sign-in failed. Try again.",
                "We couldn't sign you in.",
                "Check your details and try again."
            ]
        }

        return tone_suggestions.get(
            tone,
            tone_suggestions["friendly"]
        )

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return [
        "Sign in to continue.",
        "Continue to your account.",
        "Welcome back!"
    ]


# ============================================================
# Signup Suggestions
# ============================================================

def generate_signup_suggestions(intent, tone):

    tone = normalize_tone(tone)

    if intent == "Create Account":

        tone_suggestions = {

            "friendly": [
                "Create your account to get started.",
                "Welcome! Sign up and join us.",
                "Let's create your account together."
            ],

            "professional": [
                "Create your account to continue.",
                "Complete your registration to proceed.",
                "Register your account to get started."
            ],

            "casual": [
                "Ready to join? Create your account!",
                "Let's make your account and get started.",
                "Sign up and jump right in."
            ],

            "helpful": [
                "Create your account to continue.",
                "Enter your details to create your account.",
                "Sign up to get started with your account."
            ],

            "simple": [
                "Create your account.",
                "Sign up to continue.",
                "Create an account to get started."
            ]
        }

        return tone_suggestions.get(
            tone,
            tone_suggestions["friendly"]
        )

    if intent == "User Login":

        return {
            "friendly": [
                "Already have an account? Welcome back!",
                "Good to see you again! Sign in.",
                "Welcome back! Let's get you signed in."
            ],
            "professional": [
                "Already have an account? Please sign in.",
                "Sign in to access your account.",
                "Please enter your details to sign in."
            ],
            "casual": [
                "Already a member? Log in!",
                "Back again? Sign in and jump in.",
                "Got an account? Let's get you logged in."
            ],
            "helpful": [
                "Already have an account? Sign in to continue.",
                "Use your account details to sign in.",
                "Sign in to access your existing account."
            ],
            "simple": [
                "Already have an account? Sign in.",
                "Sign in to your account.",
                "Log in to continue."
            ]
        }.get(tone, [
            "Already have an account? Sign in.",
            "Welcome back! Sign in to continue.",
            "Sign in to your account."
        ])

    if intent == "Get Started":

        return {
            "friendly": [
                "Ready to begin? Create your account!",
                "Let's get you started.",
                "Join us and get started today."
            ],
            "professional": [
                "Create your account to begin.",
                "Register to get started.",
                "Complete registration to continue."
            ],
            "casual": [
                "Ready? Sign up and let's go!",
                "Let's get your account set up.",
                "Join us and jump right in."
            ],
            "helpful": [
                "Create an account to get started.",
                "Sign up first to continue.",
                "Enter your details to begin."
            ],
            "simple": [
                "Create an account to start.",
                "Sign up to begin.",
                "Create your account."
            ]
        }.get(tone, [
            "Create your account and get started.",
            "Ready to begin? Sign up now.",
            "Start by creating your account."
        ])

    if intent == "Show Error":

        return {
            "friendly": [
                "Oops! We couldn't create your account.",
                "Something went wrong. Let's try again.",
                "Sorry, we couldn't finish your signup."
            ],
            "professional": [
                "We could not create your account.",
                "Registration was unsuccessful. Please try again.",
                "We could not complete your registration."
            ],
            "casual": [
                "Oops! That signup didn't work.",
                "Something went wrong. Try again.",
                "We couldn't finish that. Give it another try."
            ],
            "helpful": [
                "We couldn't create your account. Please check your details.",
                "Check your information and try signing up again.",
                "Please review your details and try again."
            ],
            "simple": [
                "We couldn't create your account.",
                "Signup failed. Try again.",
                "Check your details and try again."
            ]
        }.get(tone, [
            "We couldn't create your account.",
            "Something went wrong. Please try again.",
            "We couldn't complete your signup."
        ])

    return [
        "Create your account.",
        "Sign up to continue.",
        "Get started by creating an account."
    ]


# ============================================================
# Payment Suggestions
# ============================================================

def generate_payment_suggestions(intent, tone):

    tone = normalize_tone(tone)

    if intent == "Make Payment":

        return {
            "friendly": [
                "You're almost there! Confirm your payment.",
                "Ready to pay? Review and confirm.",
                "All set? Confirm your payment to finish."
            ],
            "professional": [
                "Review your payment details and confirm.",
                "Please confirm your payment to continue.",
                "Verify your payment details before completing."
            ],
            "casual": [
                "Ready to pay? Let's finish up!",
                "Check the details and hit pay.",
                "Almost done! Confirm your payment."
            ],
            "helpful": [
                "Review your payment details before confirming.",
                "Check your details and confirm your payment.",
                "Make sure everything looks right, then pay."
            ],
            "simple": [
                "Review and confirm your payment.",
                "Confirm your payment.",
                "Complete your payment."
            ]
        }.get(tone, [
            "Review your payment details and confirm.",
            "Confirm your payment to continue.",
            "Your payment is ready to complete."
        ])

    if intent == "User Login":

        return {
            "friendly": [
                "Welcome back! Sign in to continue your payment.",
                "Good to see you! Sign in to pay.",
                "Sign in and let's finish your payment."
            ],
            "professional": [
                "Please sign in to continue with your payment.",
                "Sign in to complete your payment.",
                "Authenticate your account to proceed with payment."
            ],
            "casual": [
                "Log in and let's get that payment done.",
                "Sign in to keep your payment moving.",
                "Ready to pay? Log in first."
            ],
            "helpful": [
                "Sign in to continue securely with your payment.",
                "Use your account details to continue payment.",
                "Sign in first to complete your payment."
            ],
            "simple": [
                "Sign in to continue payment.",
                "Log in to complete payment.",
                "Sign in before paying."
            ]
        }.get(tone, [
            "Sign in to continue with your payment.",
            "Sign in to complete your payment.",
            "Log in to continue securely."
        ])

    if intent == "Show Error":

        return {
            "friendly": [
                "Oops! Your payment didn't go through.",
                "Sorry, we couldn't process your payment.",
                "Something went wrong. Let's try that payment again."
            ],
            "professional": [
                "We could not process your payment.",
                "Payment processing was unsuccessful.",
                "Your payment could not be completed."
            ],
            "casual": [
                "Oops! The payment didn't work.",
                "That payment didn't go through. Try again.",
                "Something went wrong with the payment."
            ],
            "helpful": [
                "We couldn't process your payment. Check your details and try again.",
                "Please check your payment details and retry.",
                "Try again after reviewing your payment information."
            ],
            "simple": [
                "Payment failed. Try again.",
                "We couldn't process your payment.",
                "Check your payment details and try again."
            ]
        }.get(tone, [
            "We couldn't process your payment.",
            "Payment failed. Please try again.",
            "Something went wrong with your payment."
        ])

    return [
        "Review your payment details.",
        "Confirm your payment to continue.",
        "Continue with your payment."
    ]


# ============================================================
# Dashboard Suggestions
# ============================================================

def generate_dashboard_suggestions(intent, tone):

    tone = normalize_tone(tone)

    if intent == "Get Started":

        return {
            "friendly": [
                "Welcome! Let's get started.",
                "You're all set. Let's begin!",
                "Ready to explore? Let's go!"
            ],
            "professional": [
                "Get started from your dashboard.",
                "Your dashboard is ready to use.",
                "Continue to begin using your dashboard."
            ],
            "casual": [
                "Ready? Let's jump in!",
                "Your dashboard is ready. Let's go!",
                "Take a look around and get started."
            ],
            "helpful": [
                "Explore your dashboard to get started.",
                "Choose an option below to begin.",
                "Start by exploring your dashboard."
            ],
            "simple": [
                "Let's get started.",
                "Start exploring your dashboard.",
                "Your dashboard is ready."
            ]
        }.get(tone, [
            "Welcome! Let's get started.",
            "You're ready to get started.",
            "Explore your dashboard to begin."
        ])

    if intent == "User Login":

        return {
            "friendly": [
                "Welcome back to your dashboard!",
                "Great to see you again!",
                "Welcome back! Ready to explore?"
            ],
            "professional": [
                "Welcome to your account dashboard.",
                "Your dashboard is ready to use.",
                "Access your account overview here."
            ],
            "casual": [
                "Hey, you're back! Let's take a look.",
                "Welcome back! See what's new.",
                "Ready to jump back in?"
            ],
            "helpful": [
                "Your dashboard shows your latest account activity.",
                "Explore your dashboard to manage your account.",
                "Use your dashboard to view your account details."
            ],
            "simple": [
                "Welcome back.",
                "View your dashboard.",
                "Your account overview is here."
            ]
        }.get(tone, [
            "Welcome back to your dashboard.",
            "You're signed in and ready to go.",
            "Welcome back! Explore your dashboard."
        ])

    if intent == "Show Error":

        return {
            "friendly": [
                "Oops! We couldn't load your dashboard.",
                "Sorry, something went wrong. Let's try again.",
                "Your dashboard didn't load. Please try again."
            ],
            "professional": [
                "We could not load your dashboard.",
                "The dashboard could not be loaded.",
                "We were unable to load your dashboard."
            ],
            "casual": [
                "Oops! Your dashboard didn't load.",
                "Something went wrong. Try again.",
                "The dashboard is taking a break. Try again."
            ],
            "helpful": [
                "We couldn't load your dashboard. Please try again.",
                "Check your connection and try loading the dashboard again.",
                "Please try refreshing your dashboard."
            ],
            "simple": [
                "Dashboard failed to load.",
                "We couldn't load your dashboard.",
                "Try loading the dashboard again."
            ]
        }.get(tone, [
            "We couldn't load your dashboard.",
            "Something went wrong. Please try again.",
            "Your dashboard could not be loaded."
        ])

    if intent == "Update Profile":

        return {
            "friendly": [
                "Keep your profile fresh and up to date!",
                "Want to update your profile?",
                "Let's keep your profile looking good."
            ],
            "professional": [
                "Update your profile information.",
                "Review and update your account details.",
                "Keep your profile information current."
            ],
            "casual": [
                "Want to change something? Edit your profile.",
                "Let's update your profile.",
                "Make a few changes to your profile."
            ],
            "helpful": [
                "Review your profile and update any details that changed.",
                "Update your profile information when needed.",
                "Check your details and save your changes."
            ],
            "simple": [
                "Update your profile.",
                "Edit your profile details.",
                "Review your profile."
            ]
        }.get(tone, [
            "Update your profile details.",
            "Keep your profile information up to date.",
            "Review and update your profile."
        ])

    return {
        "friendly": [
            "Welcome to your dashboard!",
            "Here's what's happening with your account.",
            "Ready to explore your dashboard?"
        ],
        "professional": [
            "Welcome to your account dashboard.",
            "Review your latest account activity.",
            "View your account overview."
        ],
        "casual": [
            "Here's what's happening!",
            "Take a look around your dashboard.",
            "See what's new in your account."
        ],
        "helpful": [
            "Use your dashboard to review your account activity.",
            "Explore the dashboard to manage your account.",
            "View your latest account information here."
        ],
        "simple": [
            "Welcome to your dashboard.",
            "View your account activity.",
            "See your account overview."
        ]
    }.get(tone, [
        "Welcome to your dashboard.",
        "Explore your latest activity.",
        "Here's your account overview."
    ])


# ============================================================
# Profile Suggestions
# ============================================================

def generate_profile_suggestions(intent, tone):

    tone = normalize_tone(tone)

    if intent == "Update Profile":

        return {
            "friendly": [
                "Let's keep your profile up to date!",
                "Want to refresh your profile details?",
                "Keep your personal details looking good."
            ],
            "professional": [
                "Update your profile details.",
                "Review and save your profile changes.",
                "Keep your personal information current."
            ],
            "casual": [
                "Want to change something? Edit your profile.",
                "Let's update your details.",
                "Make some changes to your profile."
            ],
            "helpful": [
                "Review your details and save any changes.",
                "Update your profile information when needed.",
                "Check your details before saving your changes."
            ],
            "simple": [
                "Update your profile.",
                "Edit your profile details.",
                "Save your profile changes."
            ]
        }.get(tone, [
            "Update your profile details.",
            "Keep your personal details up to date.",
            "Review and save your profile changes."
        ])

    if intent == "Show Error":

        return {
            "friendly": [
                "Oops! We couldn't update your profile.",
                "Sorry, something went wrong. Try again.",
                "Your changes didn't save. Let's try again."
            ],
            "professional": [
                "We could not update your profile.",
                "Your profile changes could not be saved.",
                "We were unable to update your profile."
            ],
            "casual": [
                "Oops! Your changes didn't save.",
                "Something went wrong. Give it another try.",
                "We couldn't update that. Try again."
            ],
            "helpful": [
                "We couldn't update your profile. Please try again.",
                "Check your details and try saving again.",
                "Please review your changes and try again."
            ],
            "simple": [
                "Profile update failed.",
                "We couldn't update your profile.",
                "Try saving your changes again."
            ]
        }.get(tone, [
            "We couldn't update your profile.",
            "Something went wrong. Please try again.",
            "Your profile could not be updated."
        ])

    if intent == "User Login":

        return {
            "friendly": [
                "Welcome back! Want to view your profile?",
                "Good to see you! Check your profile.",
                "Let's take a look at your profile."
            ],
            "professional": [
                "Sign in to access your profile.",
                "Sign in to manage your profile.",
                "Access your profile after signing in."
            ],
            "casual": [
                "Want to check your profile? Log in.",
                "Let's see your profile.",
                "Jump into your profile."
            ],
            "helpful": [
                "Sign in to view and manage your profile.",
                "Use your account to access your profile.",
                "Sign in to manage your profile details."
            ],
            "simple": [
                "Sign in to view your profile.",
                "Open your profile.",
                "View your profile."
            ]
        }.get(tone, [
            "Sign in to view your profile.",
            "Sign in to manage your profile.",
            "Welcome back! View your profile."
        ])

    if intent == "Get Started":

        return {
            "friendly": [
                "Let's complete your profile together!",
                "Ready to add your details?",
                "Let's get your profile ready!"
            ],
            "professional": [
                "Complete your profile to continue.",
                "Add your profile information to proceed.",
                "Enter your details to complete your profile."
            ],
            "casual": [
                "Let's fill out your profile!",
                "Ready to add your details?",
                "Let's get your profile set up."
            ],
            "helpful": [
                "Add your details to complete your profile.",
                "Enter your information to get your profile ready.",
                "Complete your profile to continue."
            ],
            "simple": [
                "Complete your profile.",
                "Add your details.",
                "Set up your profile."
            ]
        }.get(tone, [
            "Complete your profile to get started.",
            "Add your details to get started.",
            "Let's complete your profile."
        ])

    return {
        "friendly": [
            "Here's your profile.",
            "Want to take a look at your profile?",
            "Your profile is ready to view."
        ],
        "professional": [
            "View your profile information.",
            "Review your account details.",
            "Manage your profile information."
        ],
        "casual": [
            "Here's your profile.",
            "Take a look at your details.",
            "Check out your profile."
        ],
        "helpful": [
            "Review your profile information here.",
            "Use this page to manage your profile.",
            "Check your account details here."
        ],
        "simple": [
            "View your profile.",
            "Review your details.",
            "Manage your profile."
        ]
    }.get(tone, [
        "View your profile.",
        "Manage your account details.",
        "Review your personal information."
    ])


# ============================================================
# Error Suggestions
# ============================================================

def generate_error_suggestions(intent, tone):

    tone = normalize_tone(tone)

    if intent == "Show Error":

        return {
            "friendly": [
                "Oops! Something went wrong. Let's try again.",
                "Sorry, that didn't work. Please try again.",
                "Something went wrong. We'll get you back on track."
            ],
            "professional": [
                "We could not complete your request.",
                "An error occurred. Please try again.",
                "Your request could not be completed."
            ],
            "casual": [
                "Oops! That didn't work. Try again.",
                "Something went wrong. Give it another shot.",
                "That didn't go as planned. Let's try again."
            ],
            "helpful": [
                "Something went wrong. Please check your details and try again.",
                "Please review your information and try again.",
                "We couldn't complete this action. Please try again."
            ],
            "simple": [
                "Something went wrong.",
                "Please try again.",
                "We couldn't complete this request."
            ]
        }.get(tone, [
            "Something went wrong. Please try again.",
            "We couldn't complete your request.",
            "Please check your details and try again."
        ])

    if intent == "User Login":

        return {
            "friendly": [
                "Oops! We couldn't sign you in. Try again.",
                "Sorry, we couldn't log you in.",
                "Let's try signing you in again."
            ],
            "professional": [
                "We could not sign you in. Please try again.",
                "Sign-in was unsuccessful.",
                "Your sign-in could not be completed."
            ],
            "casual": [
                "Oops! Login didn't work. Try again.",
                "Couldn't log you in. Give it another try.",
                "Something went wrong with your login."
            ],
            "helpful": [
                "Check your login details and try again.",
                "Make sure your details are correct, then sign in again.",
                "Please check your password and try again."
            ],
            "simple": [
                "Sign-in failed.",
                "We couldn't sign you in.",
                "Check your details and try again."
            ]
        }.get(tone, [
            "We couldn't sign you in. Please try again.",
            "Sign in failed. Please check your details.",
            "Please check your login details and try again."
        ])

    if intent == "Make Payment":

        return {
            "friendly": [
                "Oops! Your payment didn't go through.",
                "Sorry, we couldn't process your payment.",
                "Let's try that payment again."
            ],
            "professional": [
                "We could not process your payment.",
                "Your payment could not be completed.",
                "Payment processing was unsuccessful."
            ],
            "casual": [
                "Oops! That payment didn't work.",
                "Payment didn't go through. Try again.",
                "Something went wrong with your payment."
            ],
            "helpful": [
                "Check your payment details and try again.",
                "Please review your payment information and retry.",
                "Make sure your payment details are correct."
            ],
            "simple": [
                "Payment failed.",
                "Try your payment again.",
                "Check your payment details."
            ]
        }.get(tone, [
            "We couldn't process your payment.",
            "Payment failed. Please try again.",
            "Please check your payment details and try again."
        ])

    if intent == "Update Profile":

        return {
            "friendly": [
                "Oops! Your profile couldn't be updated.",
                "Sorry, your changes didn't save.",
                "Let's try saving your profile again."
            ],
            "professional": [
                "We could not update your profile.",
                "Your profile changes could not be saved.",
                "The profile update was unsuccessful."
            ],
            "casual": [
                "Oops! Your profile didn't save.",
                "That update didn't work. Try again.",
                "Couldn't save those changes. Try again."
            ],
            "helpful": [
                "Check your profile details and try saving again.",
                "Please review your changes and try again.",
                "Make sure your details are correct before saving."
            ],
            "simple": [
                "Profile update failed.",
                "Your changes weren't saved.",
                "Try saving again."
            ]
        }.get(tone, [
            "We couldn't update your profile.",
            "Your changes could not be saved.",
            "Please try updating your profile again."
        ])

    return {
        "friendly": [
            "Oops! Something went wrong.",
            "Sorry, that didn't work.",
            "Let's try that again."
        ],
        "professional": [
            "We could not complete your request.",
            "An error occurred.",
            "Your request was unsuccessful."
        ],
        "casual": [
            "Oops! That didn't work.",
            "Something went wrong. Try again.",
            "Let's give that another try."
        ],
        "helpful": [
            "Something went wrong. Please try again.",
            "Please check your information and try again.",
            "Try again to continue."
        ],
        "simple": [
            "Something went wrong.",
            "Please try again.",
            "We couldn't complete this."
        ]
    }.get(tone, [
        "Something went wrong. Please try again.",
        "We couldn't complete your request.",
        "Please try again."
    ])




# ============================================================
# Persona-Based Suggestion Adjustment
# ============================================================

def generate_persona_suggestions(
    ui_context,
    intent,
    tone,
    persona
):
    """
    Add persona-aware wording to the temporary generator.
    The fine-tuned model can replace this later.
    """

    context = ui_context.lower()
    tone = normalize_tone(tone)
    persona = persona.strip().lower()

    # --------------------------------------------------------
    # Login / User Login
    # --------------------------------------------------------

    if "login" in context and intent == "User Login":

        suggestions = {

            "student": {
                "friendly": [
                    "Welcome back! Ready to sign in?",
                    "Good to see you! Sign in to continue.",
                    "Welcome back! Let's get you signed in."
                ],
                "professional": [
                    "Sign in to access your student account.",
                    "Please sign in to continue.",
                    "Enter your details to access your account."
                ],
                "casual": [
                    "Ready to log in? Let's go!",
                    "Jump back in and sign in.",
                    "Log in and pick up where you left off."
                ],
                "helpful": [
                    "Sign in to continue to your student account.",
                    "Enter your details to sign in securely.",
                    "Sign in to access your account and continue."
                ],
                "simple": [
                    "Sign in to your student account.",
                    "Log in to continue.",
                    "Enter your details to sign in."
                ]
            },

            "designer": {
                "friendly": [
                    "Welcome back! Ready to continue your work?",
                    "Good to see you! Sign in to keep creating.",
                    "Welcome back! Let's get you into your workspace."
                ],
                "professional": [
                    "Sign in to access your design workspace.",
                    "Please sign in to continue to your workspace.",
                    "Enter your details to access your workspace."
                ],
                "casual": [
                    "Ready to create? Let's get you signed in.",
                    "Jump back into your workspace.",
                    "Log in and get back to designing."
                ],
                "helpful": [
                    "Sign in to continue to your design workspace.",
                    "Enter your details to access your workspace.",
                    "Sign in to continue your design work."
                ],
                "simple": [
                    "Sign in to your workspace.",
                    "Log in to continue designing.",
                    "Enter your details to sign in."
                ]
            },

            "developer": {
                "friendly": [
                    "Welcome back! Ready to get coding?",
                    "Good to see you! Sign in to continue.",
                    "Welcome back! Let's get you into your workspace."
                ],
                "professional": [
                    "Sign in to access your developer workspace.",
                    "Please sign in to continue.",
                    "Enter your details to access your account."
                ],
                "casual": [
                    "Ready to code? Let's get you signed in.",
                    "Jump back into your workspace.",
                    "Log in and get back to coding."
                ],
                "helpful": [
                    "Sign in to continue to your developer workspace.",
                    "Enter your details to access your workspace.",
                    "Sign in to continue your development work."
                ],
                "simple": [
                    "Sign in to your developer account.",
                    "Log in to continue.",
                    "Enter your details to sign in."
                ]
            },

            "business user": {
                "friendly": [
                    "Welcome back! Ready to get things moving?",
                    "Good to see you! Sign in to continue.",
                    "Welcome back! Let's get you into your account."
                ],
                "professional": [
                    "Sign in to access your business account.",
                    "Please sign in to continue to your account.",
                    "Enter your details to access your account."
                ],
                "casual": [
                    "Ready to get back to work? Sign in.",
                    "Jump back into your account.",
                    "Log in and get back to business."
                ],
                "helpful": [
                    "Sign in to continue to your business account.",
                    "Enter your details to access your account.",
                    "Sign in to manage your account."
                ],
                "simple": [
                    "Sign in to your business account.",
                    "Log in to continue.",
                    "Enter your details to sign in."
                ]
            },

            "general user": {
                "friendly": [
                    "Welcome back! Ready to sign in?",
                    "Good to see you! Let's get you signed in.",
                    "Welcome back! Let's continue."
                ],
                "professional": [
                    "Sign in to access your account.",
                    "Please sign in to continue.",
                    "Enter your details to access your account."
                ],
                "casual": [
                    "Ready to log in? Let's go!",
                    "Jump back in and sign in.",
                    "Log in and keep going."
                ],
                "helpful": [
                    "Sign in to continue to your account.",
                    "Enter your details to sign in securely.",
                    "Sign in to access your account and continue."
                ],
                "simple": [
                    "Sign in to your account.",
                    "Log in to continue.",
                    "Enter your details to sign in."
                ]
            }
        }

        persona_set = suggestions.get(
            persona,
            suggestions["general user"]
        )

        return persona_set.get(
            tone,
            persona_set["friendly"]
        )

    # --------------------------------------------------------
    # Signup / Create Account
    # --------------------------------------------------------
    if "signup" in context and intent == "Create Account":
        focus = {
            "student": "student account",
            "designer": "design workspace",
            "developer": "developer account",
            "business user": "business account",
            "general user": "account"
        }.get(persona, "account")

        templates = {
            "friendly": [
                f"Create your {focus} and get started.",
                f"Welcome! Set up your {focus} to begin.",
                f"Let's get your {focus} ready."
            ],
            "professional": [
                f"Create your {focus} to continue.",
                f"Complete your {focus} registration.",
                f"Set up your {focus} to get started."
            ],
            "casual": [
                f"Ready? Create your {focus} and jump in.",
                f"Let's set up your {focus}.",
                f"Create your {focus} and get going."
            ],
            "helpful": [
                f"Enter your details to create your {focus}.",
                f"Create your {focus} to continue.",
                f"Set up your {focus} to get started."
            ],
            "simple": [
                f"Create your {focus}.",
                f"Set up your {focus} to continue.",
                f"Start with your {focus}."
            ]
        }
        return templates.get(tone, templates["friendly"])

    # --------------------------------------------------------
    # Dashboard / common dashboard intents
    # --------------------------------------------------------
    if "dashboard" in context:
        focus = {
            "student": "student dashboard",
            "designer": "design workspace",
            "developer": "developer workspace",
            "business user": "business workspace",
            "general user": "dashboard"
        }.get(persona, "dashboard")

        if intent == "Show Error":
            templates = {
                "friendly": [
                    f"Oops! We couldn't load your {focus}.",
                    "Sorry, something went wrong. Let's try again.",
                    f"Your {focus} didn't load. Please try again."
                ],
                "professional": [
                    f"We could not load your {focus}.",
                    f"Your {focus} could not be loaded.",
                    "Please try again to continue."
                ],
                "casual": [
                    f"Oops! Your {focus} didn't load.",
                    "Something went wrong. Try again.",
                    f"Your {focus} needs another try."
                ],
                "helpful": [
                    f"We couldn't load your {focus}. Please try again.",
                    "Check your connection and try again.",
                    f"Please refresh your {focus}."
                ],
                "simple": [
                    f"Your {focus} failed to load.",
                    f"We couldn't load your {focus}.",
                    f"Try loading your {focus} again."
                ]
            }
            return templates.get(tone, templates["friendly"])

        if intent == "User Login":
            templates = {
                "friendly": [
                    f"Welcome back to your {focus}!",
                    f"Great to see you! Explore your {focus}.",
                    f"Ready to explore your {focus}?"
                ],
                "professional": [
                    f"Welcome to your {focus}.",
                    f"Access your {focus} overview.",
                    f"Review your {focus} information."
                ],
                "casual": [
                    f"Hey, welcome back to your {focus}!",
                    f"Ready to jump into your {focus}?",
                    f"Take a look around your {focus}."
                ],
                "helpful": [
                    f"Explore your {focus} to manage your work.",
                    f"Use your {focus} to view your latest activity.",
                    f"Review your {focus} information here."
                ],
                "simple": [
                    f"Welcome to your {focus}.",
                    f"View your {focus}.",
                    f"Explore your {focus}."
                ]
            }
            return templates.get(tone, templates["friendly"])

        templates = {
            "friendly": [
                f"Welcome! Let's get started in your {focus}.",
                f"You're all set. Explore your {focus}!",
                f"Ready to begin with your {focus}?"
            ],
            "professional": [
                f"Get started from your {focus}.",
                f"Your {focus} is ready to use.",
                f"Continue from your {focus}."
            ],
            "casual": [
                f"Ready? Jump into your {focus}!",
                f"Your {focus} is ready. Let's go!",
                f"Take a look around your {focus}."
            ],
            "helpful": [
                f"Explore your {focus} to get started.",
                f"Choose an option in your {focus} to begin.",
                f"Start by exploring your {focus}."
            ],
            "simple": [
                f"Start with your {focus}.",
                f"Explore your {focus}.",
                f"Your {focus} is ready."
            ]
        }
        return templates.get(tone, templates["friendly"])

    # --------------------------------------------------------
    # Payment / Make Payment
    # --------------------------------------------------------
    if "payment" in context and intent == "Make Payment":
        focus = {
            "student": "student payment",
            "designer": "project payment",
            "developer": "project payment",
            "business user": "business payment",
            "general user": "payment"
        }.get(persona, "payment")

        templates = {
            "friendly": [
                f"You're almost there! Confirm your {focus}.",
                f"Ready to pay? Review your {focus}.",
                f"All set? Confirm your {focus} to finish."
            ],
            "professional": [
                f"Review your {focus} details and confirm.",
                f"Please confirm your {focus} to continue.",
                f"Complete your {focus} by confirming the details."
            ],
            "casual": [
                f"Ready to pay? Let's finish your {focus}!",
                f"Check your {focus} and hit pay.",
                f"Almost done! Confirm your {focus}."
            ],
            "helpful": [
                f"Review your {focus} details before confirming.",
                f"Check your {focus} details and confirm.",
                f"Make sure your {focus} looks right, then pay."
            ],
            "simple": [
                f"Review your {focus}.",
                f"Confirm your {focus}.",
                f"Complete your {focus}."
            ]
        }
        return templates.get(tone, templates["friendly"])

    # --------------------------------------------------------
    # Profile / Update Profile
    # --------------------------------------------------------
    if "profile" in context and intent == "Update Profile":
        focus = {
            "student": "student profile",
            "designer": "designer profile",
            "developer": "developer profile",
            "business user": "business profile",
            "general user": "profile"
        }.get(persona, "profile")

        templates = {
            "friendly": [
                f"Let's keep your {focus} up to date!",
                f"Want to refresh your {focus} details?",
                f"Let's keep your {focus} looking good."
            ],
            "professional": [
                f"Update your {focus} details.",
                f"Review and save your {focus} changes.",
                f"Keep your {focus} information current."
            ],
            "casual": [
                f"Want to change something? Edit your {focus}.",
                f"Let's update your {focus}.",
                f"Make a few changes to your {focus}."
            ],
            "helpful": [
                f"Review your {focus} and save any changes.",
                f"Update your {focus} information when needed.",
                f"Check your {focus} details before saving."
            ],
            "simple": [
                f"Update your {focus}.",
                f"Edit your {focus} details.",
                f"Save your {focus} changes."
            ]
        }
        return templates.get(tone, templates["friendly"])

    # --------------------------------------------------------
    # Error Screen / Show Error
    # --------------------------------------------------------
    if "error" in context and intent == "Show Error":
        focus = {
            "student": "student account",
            "designer": "design workspace",
            "developer": "developer workspace",
            "business user": "business account",
            "general user": "account"
        }.get(persona, "account")

        templates = {
            "friendly": [
                f"Oops! We could not complete the action in your {focus}.",
                "Sorry, that did not work. Let's try again.",
                f"We could not complete that in your {focus}."
            ],
            "professional": [
                f"We could not complete this action for your {focus}.",
                f"An error occurred with your {focus}.",
                "Please try again to continue."
            ],
            "casual": [
                f"Oops! We could not complete the action in your {focus}.",
                "That did not work. Try again.",
                f"Please try your {focus} again."
            ],
            "helpful": [
                f"We could not complete the action in your {focus}. Please try again.",
                f"Check your {focus} details and try again.",
                "Please review your information and try again."
            ],
            "simple": [
                f"We could not complete the action in your {focus}.",
                "Please try again.",
                f"We could not complete this for your {focus}."
            ]
        }
        return templates.get(tone, templates["friendly"])

    return None


# ============================================================
# Generic Generator
# ============================================================

def generate_generic_suggestions(
    ui_context,
    intent,
    tone,
    persona
):

    context = ui_context.lower()

    # Use persona-aware suggestions for all supported contexts.
    persona_suggestions = generate_persona_suggestions(
        ui_context,
        intent,
        tone,
        persona
    )

    if persona_suggestions is not None:
        return persona_suggestions

    if "login" in context:
        return generate_login_suggestions(intent, tone)

    if "signup" in context:
        return generate_signup_suggestions(intent, tone)

    if "payment" in context:
        return generate_payment_suggestions(intent, tone)

    if "dashboard" in context:
        return generate_dashboard_suggestions(intent, tone)

    if "profile" in context:
        return generate_profile_suggestions(intent, tone)

    if "error" in context:
        return generate_error_suggestions(intent, tone)

    return [
        clean_text(f"Continue with {intent.lower()}."),
        "Review the information and continue.",
        "Complete this step to continue."
    ]


# ============================================================
# Remove Previous Suggestions
# ============================================================

def remove_previous_suggestions(
    suggestions,
    previous_suggestions
):

    if not previous_suggestions:
        return suggestions

    previous_normalized = {
        clean_text(item).lower()
        for item in previous_suggestions
        if item
    }

    new_suggestions = []

    for suggestion in suggestions:

        cleaned = clean_text(suggestion)

        if cleaned.lower() not in previous_normalized:
            new_suggestions.append(cleaned)

    return new_suggestions


# ============================================================
# Alternative Suggestions for Regeneration
# ============================================================

def generate_alternative_suggestions(
    ui_context,
    intent,
    tone,
    persona,
    previous_suggestions
):

    context = ui_context.lower()
    tone = normalize_tone(tone)

    # --------------------------------------------------------
    # Login alternatives
    # --------------------------------------------------------

    if "login" in context and intent == "User Login":

        alternatives_by_tone = {

            "friendly": [
                "Great to see you! Let's get you signed in.",
                "Welcome back! Your account is waiting.",
                "Ready to jump back in?",
                "Let's get you back to your account."
            ],

            "professional": [
                "Access your account by signing in.",
                "Please enter your credentials to continue.",
                "Sign in to securely access your account.",
                "Continue by signing in to your account."
            ],

            "casual": [
                "Ready to jump back in?",
                "Let's get you logged in!",
                "Back again? Sign in and let's go.",
                "Log in and pick up where you left off."
            ],

            "helpful": [
                "Enter your details to access your account.",
                "Sign in to continue where you left off.",
                "Use your account details to sign in.",
                "Check your login details and continue."
            ],

            "simple": [
                "Log in to continue.",
                "Access your account.",
                "Sign in and continue.",
                "Enter your details to log in."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # --------------------------------------------------------
    # Signup alternatives
    # --------------------------------------------------------

    elif "signup" in context and intent == "Create Account":

        alternatives_by_tone = {

            "friendly": [
                "We're happy to have you! Create your account.",
                "Let's get your account ready.",
                "Welcome! Sign up and join us.",
                "Start your journey with us."
            ],

            "professional": [
                "Register your account to continue.",
                "Complete your account registration.",
                "Create your account to proceed.",
                "Begin by registering your account."
            ],

            "casual": [
                "Ready to join? Let's make an account!",
                "Sign up and jump right in.",
                "Let's get your account set up.",
                "Create an account and let's go!"
            ],

            "helpful": [
                "Enter your details to create an account.",
                "Sign up to access your new account.",
                "Complete the form to create your account.",
                "Create your account to continue."
            ],

            "simple": [
                "Sign up now.",
                "Create an account.",
                "Join us to get started.",
                "Start by signing up."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # --------------------------------------------------------
    # Payment alternatives
    # --------------------------------------------------------

    elif "payment" in context and intent == "Make Payment":

        alternatives_by_tone = {

            "friendly": [
                "Almost there! Confirm your payment.",
                "You're ready to pay. Just confirm it.",
                "Everything looks good? Let's finish payment.",
                "One last step: confirm your payment."
            ],

            "professional": [
                "Verify the payment details before confirming.",
                "Please review and authorize your payment.",
                "Confirm the payment details to proceed.",
                "Complete your payment by confirming the details."
            ],

            "casual": [
                "Ready to pay? Let's finish this!",
                "Everything look good? Hit confirm.",
                "Almost done! Just confirm your payment.",
                "Check it over and let's pay."
            ],

            "helpful": [
                "Check your payment details before confirming.",
                "Review the amount and details, then confirm.",
                "Make sure everything is correct before paying.",
                "Review your payment information and finish."
            ],

            "simple": [
                "Check and confirm your payment.",
                "Confirm payment to finish.",
                "Review your payment details.",
                "Finish your payment."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # --------------------------------------------------------
    # Dashboard alternatives
    # --------------------------------------------------------

    elif "dashboard" in context:

        alternatives_by_tone = {

            "friendly": [
                "Your workspace is ready for you!",
                "Welcome back! See what's new.",
                "There's plenty to explore.",
                "Let's see what's happening."
            ],

            "professional": [
                "Review your account activity.",
                "Access your latest account information.",
                "Review your dashboard overview.",
                "Manage your account from here."
            ],

            "casual": [
                "Take a look around!",
                "Here's what's happening.",
                "See what's new.",
                "Your dashboard is ready. Jump in!"
            ],

            "helpful": [
                "Explore your dashboard to manage your account.",
                "Review your latest activity here.",
                "Use the dashboard to find your account information.",
                "Check your dashboard for recent updates."
            ],

            "simple": [
                "Explore your dashboard.",
                "View your latest activity.",
                "Check your account.",
                "Your dashboard is ready."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # --------------------------------------------------------
    # Profile alternatives
    # --------------------------------------------------------

    elif "profile" in context and intent == "Update Profile":

        alternatives_by_tone = {

            "friendly": [
                "Want to refresh your profile?",
                "Let's keep your details up to date!",
                "Give your profile a quick update.",
                "Keep your information fresh."
            ],

            "professional": [
                "Review and update your profile information.",
                "Maintain accurate profile information.",
                "Update your account details as needed.",
                "Review your profile information."
            ],

            "casual": [
                "Want to change something?",
                "Let's update your profile.",
                "Make a few changes to your details.",
                "Give your profile a quick refresh."
            ],

            "helpful": [
                "Review your details and save your changes.",
                "Update any information that has changed.",
                "Check your profile details before saving.",
                "Edit your information and save when ready."
            ],

            "simple": [
                "Edit your profile.",
                "Update your details.",
                "Change your profile information.",
                "Save your profile updates."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # --------------------------------------------------------
    # Error alternatives
    # --------------------------------------------------------

    elif "error" in context or intent == "Show Error":

        alternatives_by_tone = {

            "friendly": [
                "Oops! Let's try that again.",
                "Sorry, that didn't work. Try again.",
                "Something went wrong. We'll fix it.",
                "Let's give that another try."
            ],

            "professional": [
                "We could not complete this action.",
                "An error occurred. Please try again.",
                "The requested action could not be completed.",
                "Please try again to complete your request."
            ],

            "casual": [
                "Oops! That didn't work.",
                "Something went wrong. Try again.",
                "That didn't go as planned.",
                "Let's give it another shot."
            ],

            "helpful": [
                "Please check your information and try again.",
                "Something went wrong. Review your details and retry.",
                "Try again after checking your information.",
                "Please review your details before trying again."
            ],

            "simple": [
                "Please try again.",
                "Something went wrong.",
                "Try again to continue.",
                "We couldn't complete this."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    else:

        alternatives_by_tone = {

            "friendly": [
                "You're almost there!",
                "Let's keep going.",
                "Ready for the next step?",
                "Let's move forward."
            ],

            "professional": [
                "Continue to the next step.",
                "Review the information before continuing.",
                "Proceed to complete this step.",
                "Continue when ready."
            ],

            "casual": [
                "Let's keep going!",
                "Ready for the next step?",
                "Let's move on.",
                "You're almost there!"
            ],

            "helpful": [
                "Review the information before continuing.",
                "Check your details and continue.",
                "Complete this step to move forward.",
                "Continue when everything looks correct."
            ],

            "simple": [
                "Continue.",
                "Move to the next step.",
                "Complete this step.",
                "Keep going."
            ]
        }

        alternatives = alternatives_by_tone.get(
            tone,
            alternatives_by_tone["friendly"]
        )

    # Remove previous suggestions
    new_suggestions = remove_previous_suggestions(
        alternatives,
        previous_suggestions
    )

    # Ensure we have enough alternatives
    if len(new_suggestions) < 3:

        fallback = generate_generic_suggestions(
            ui_context,
            intent,
            tone,
            persona
        )

        fallback = remove_previous_suggestions(
            fallback,
            previous_suggestions
        )

        for suggestion in fallback:
            if suggestion.lower() not in {
                item.lower() for item in new_suggestions
            }:
                new_suggestions.append(suggestion)

    return new_suggestions


# ============================================================
# Generate Endpoint
# ============================================================

@app.post("/generate")
async def generate_microcopy(
    request: MicrocopyRequest
):

    print("\n==========================================")
    print("AI BACKEND - GENERATE REQUEST")
    print("==========================================")

    print("UI Context:", request.uiContext)
    print("Intent:", request.intent)
    print("Tone:", request.tone)
    print("Persona:", request.persona)

    print(
        "Previous suggestions:",
        request.previous_suggestions
    )

    # --------------------------------------------------------
    # Build AI prompt
    # --------------------------------------------------------

    prompt = build_prompt(
        request.uiContext,
        request.intent,
        request.tone,
        request.persona,
        request.previous_suggestions
    )

    print("\n========== GENERATED PROMPT ==========")
    print(prompt)

    # --------------------------------------------------------
    # Temporary generator
    #
    # This will later be replaced by the fine-tuned model.
    # --------------------------------------------------------

    if request.previous_suggestions:

        suggestions = generate_alternative_suggestions(
            request.uiContext,
            request.intent,
            request.tone,
            request.persona,
            request.previous_suggestions
        )

    else:

        suggestions = generate_generic_suggestions(
            request.uiContext,
            request.intent,
            request.tone,
            request.persona
        )

        # Apply persona-aware wording for supported contexts.
        persona_suggestions = generate_persona_suggestions(
            request.uiContext,
            request.intent,
            request.tone,
            request.persona
        )

        if persona_suggestions:
            suggestions = persona_suggestions

    # --------------------------------------------------------
    # Ensure exactly 3 suggestions
    # --------------------------------------------------------

    suggestions = suggestions[:3]

    while len(suggestions) < 3:

        suggestions.append(
            "Continue to complete this step."
        )

    # --------------------------------------------------------
    # Final cleaning
    # --------------------------------------------------------

    suggestions = [
        clean_text(text)
        for text in suggestions
    ]

    print("\n========== AI SUGGESTIONS ==========")

    for index, suggestion in enumerate(
        suggestions,
        start=1
    ):

        print(
            f"{index}. {suggestion}"
        )

    print("\n==========================================")
    print("AI BACKEND - GENERATION COMPLETE")
    print("==========================================\n")

    return {
        "suggestions": suggestions
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/")
async def root():

    return {
        "status": "running",
        "service": "Sparkling UX AI Backend"
    }