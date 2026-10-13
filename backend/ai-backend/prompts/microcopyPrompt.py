def build_prompt(ui_context, intent, tone, persona, previous_suggestions=None):

    previous_suggestions = previous_suggestions or []

    previous_text = "\n".join(
        f"- {suggestion}" for suggestion in previous_suggestions
    )

    prompt = f"""
You are an expert UX Writing Assistant.

Generate THREE NEW UX microcopy suggestions.

UI Context:
{ui_context}

Intent:
{intent}

Tone:
{tone}

Persona:
{persona}

Previous suggestions:
{previous_text if previous_text else "None"}

Rules:
- Generate exactly 3 suggestions.
- Suggestions MUST be different from the previous suggestions.
- Do not repeat or slightly rewrite the previous suggestions.
- Try different wording and sentence structures.
- Keep each suggestion short.
- Keep each suggestion clear.
- Match the UI context.
- Match the user intent.
- Follow the requested tone.
- Consider the persona.
- Keep each suggestion under 80 characters.
- Avoid difficult technical words.
- Return only the 3 microcopy suggestions.
"""

    return prompt