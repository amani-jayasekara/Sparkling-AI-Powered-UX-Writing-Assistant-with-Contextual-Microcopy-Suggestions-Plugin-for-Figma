// ============================================================
// Context Validation
// ============================================================

function validateContext(uiContext, suggestions) {

    if (!Array.isArray(suggestions)) {
        return [];
    }

    if (!uiContext) {
        return [];
    }


    // --------------------------------------------------------
    // Context keywords
    // --------------------------------------------------------

    const contextRules = {

        "Login Screen": [
            "login",
            "log in",
            "sign in",
            "signin",
            "account",
            "password",
            "welcome back"
        ],


        "Signup Screen": [
            "sign up",
            "signup",
            "create",
            "account",
            "register",
            "registration",
            "join"
        ],


        "Dashboard": [
            "dashboard",
            "overview",
            "activity",
            "summary",
            "account",
            "explore",
            "get started",
            "ready to get started",
            "welcome"
        ],


        "Payment Screen": [
            "payment",
            "pay",
            "transaction",
            "confirm",
            "purchase",
            "billing",
            "checkout"
        ],


        "Profile Screen": [
            "profile",
            "account",
            "personal",
            "details",
            "update",
            "save your changes",
            "personal information"
        ],


        "Error Screen": [
            "error",
            "wrong",
            "failed",
            "failure",
            "problem",
            "issue",
            "try again",
            "couldn't",
            "could not",
            "unable",
            "went wrong"
        ]
    };


    // --------------------------------------------------------
    // Get rules for selected context
    // --------------------------------------------------------

    const keywords =
        contextRules[uiContext] || [];


    // --------------------------------------------------------
    // Validate suggestions
    // --------------------------------------------------------

    const validSuggestions = [];


    for (const suggestion of suggestions) {

        // Ignore invalid values
        if (typeof suggestion !== "string") {
            continue;
        }


        const text =
            suggestion.trim();


        // Ignore empty suggestions
        if (text === "") {
            continue;
        }


        const lowerText =
            text.toLowerCase();


        // ----------------------------------------------------
        // Check context keywords
        // ----------------------------------------------------

        const matchesContext =
            keywords.some(
                keyword =>
                    lowerText.includes(
                        keyword.toLowerCase()
                    )
            );


        if (matchesContext) {

            validSuggestions.push(text);

            continue;
        }


        // ----------------------------------------------------
        // Context-specific semantic rules
        //
        // These allow natural UX writing that does not
        // necessarily contain the exact context name.
        // ----------------------------------------------------

        let semanticallyValid = false;


        // ====================================================
        // Login Screen
        // ====================================================

        if (uiContext === "Login Screen") {

            const loginPatterns = [
                "continue",
                "ready to sign",
                "welcome",
                "your account"
            ];


            semanticallyValid =
                loginPatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ====================================================
        // Signup Screen
        // ====================================================

        else if (
            uiContext === "Signup Screen"
        ) {

            const signupPatterns = [
                "get started",
                "get started today",
                "join us",
                "new here"
            ];


            semanticallyValid =
                signupPatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ====================================================
        // Dashboard
        // ====================================================

        else if (
            uiContext === "Dashboard"
        ) {

            const dashboardPatterns = [
                "get started",
                "ready to get started",
                "let's get started",
                "explore",
                "welcome",
                "ready to go",
                "latest activity"
            ];


            semanticallyValid =
                dashboardPatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ====================================================
        // Payment Screen
        // ====================================================

        else if (
            uiContext === "Payment Screen"
        ) {

            const paymentPatterns = [
                "confirm",
                "complete",
                "continue",
                "review",
                "ready",
                "details"
            ];


            semanticallyValid =
                paymentPatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ====================================================
        // Profile Screen
        // ====================================================

        else if (
            uiContext === "Profile Screen"
        ) {

            const profilePatterns = [
                "update",
                "save",
                "personal",
                "details",
                "information",
                "changes"
            ];


            semanticallyValid =
                profilePatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ====================================================
        // Error Screen
        // ====================================================

        else if (
            uiContext === "Error Screen"
        ) {

            const errorPatterns = [
                "something went wrong",
                "couldn't complete",
                "could not complete",
                "please try again",
                "unable to",
                "failed",
                "check your details"
            ];


            semanticallyValid =
                errorPatterns.some(
                    pattern =>
                        lowerText.includes(pattern)
                );
        }


        // ----------------------------------------------------
        // Add semantically valid suggestion
        // ----------------------------------------------------

        if (semanticallyValid) {

            validSuggestions.push(text);
        }
    }


    return validSuggestions;
}


module.exports = validateContext;