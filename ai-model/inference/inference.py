import os
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
)

from peft import PeftModel


# ============================================================
# CONFIGURATION
# ============================================================

BASE_MODEL = "meta-llama/Llama-3.2-3B-Instruct"

ADAPTER_PATH = os.getenv(
    "SPARKLING_ADAPTER_PATH",
    "./final_adapter"
)

HF_TOKEN = os.getenv("HF_TOKEN")


# ============================================================
# MODEL SERVICE
# ============================================================

class SparklingModel:

    def __init__(self):

        print("=" * 70)
        print("LOADING SPARKLING MODEL")
        print("=" * 70)

        # ----------------------------------------------------
        # Quantization
        # ----------------------------------------------------

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )

        # ----------------------------------------------------
        # Tokenizer
        # ----------------------------------------------------

        self.tokenizer = AutoTokenizer.from_pretrained(
            BASE_MODEL,
            token=HF_TOKEN,
        )

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        # ----------------------------------------------------
        # Base model
        # ----------------------------------------------------

        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            quantization_config=bnb_config,
            device_map="auto",
            token=HF_TOKEN,
        )

        # ----------------------------------------------------
        # Sparkling LoRA adapter
        # ----------------------------------------------------

        self.model = PeftModel.from_pretrained(
            base_model,
            ADAPTER_PATH,
        )

        self.model.eval()

        print("✅ Sparkling model loaded successfully")

    # ========================================================
    # GENERATE MICROCOPY
    # ========================================================

    def generate(self, prompt):

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
        )

        inputs = {
            key: value.to(self.model.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            output = self.model.generate(
                **inputs,
                max_new_tokens=30,
                do_sample=False,
                temperature=0.1,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        # Remove input tokens
        generated_tokens = output[
            0
        ][
            inputs["input_ids"].shape[1]:
        ]

        result = self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True,
        )

        return result.strip()


# ============================================================
# PROMPT BUILDER
# ============================================================

def build_prompt(
    component_type,
    component_role,
    current_text,
    screen_type,
    ui_context,
    nearby_text,
    intent,
    persona,
    tone,
    accessibility_requirement,
):

    return f"""### Instruction:

Generate context-aware UX microcopy.

Generate ONE concise UX microcopy suggestion.
Return ONLY the suggested microcopy.
Do NOT provide a rationale.
Do NOT explain your answer.
Do NOT provide multiple suggestions.

### Input:

Component type: {component_type}
Component role: {component_role}
Current text: {current_text}
Screen type: {screen_type}
UI context: {ui_context}
Nearby text: {nearby_text}
Intent: {intent}
Persona: {persona}
Tone: {tone}
Accessibility requirement: {accessibility_requirement}

### Response:
"""


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    model = SparklingModel()

    prompt = build_prompt(
        component_type="button",
        component_role="primary_action",
        current_text="Upload",
        screen_type="file_upload",
        ui_context="Primary task: upload document",
        nearby_text="Add a PDF or DOCX document, up to 10 MB.",
        intent="upload_document",
        persona="experienced_user",
        tone="professional",
        accessibility_requirement="specific action",
    )

    print("\nPrompt:")
    print(prompt)

    result = model.generate(prompt)

    print("\nSparkling output:")
    print(result)
