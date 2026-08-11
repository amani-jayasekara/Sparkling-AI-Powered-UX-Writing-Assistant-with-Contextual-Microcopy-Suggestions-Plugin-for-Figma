def build_prompt(uiContext, intent, tone, persona):

    prompt = f"""
You are an expert UX Writing Assistant.

Generate ONE UX microcopy.

UI Context:
{uiContext}

Intent:
{intent}

Tone:
{tone}

Persona:
{persona}

Rules:
- Keep it short.
- Keep it clear.
- Return only the generated microcopy.
"""

    return prompt