from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class GenerateRequest(BaseModel):
    uiContext: str
    intent: str
    tone: Optional[str] = "Friendly"
    persona: Optional[str] = "General User"

@app.get("/")
def home():
    return {"message": "AI Backend is Running"}

@app.post("/generate")
def generate(request: GenerateRequest):

    suggestions = [

        f"Welcome! This is a {request.tone.lower()} message for the {request.uiContext}.",

        f"Sign in to continue using the {request.uiContext}.",

        f"Let's get started! Access your {request.uiContext} now."

    ]

    return {
        "suggestions": suggestions
    }