import os
import torch

from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
)

from peft import LoraConfig
from trl import SFTTrainer


# ============================================================
# SPARKLING MODEL CONFIGURATION
# ============================================================

BASE_MODEL = "meta-llama/Llama-3.2-3B-Instruct"

TRAIN_FILE = "../data/train.jsonl"
VALIDATION_FILE = "../data/validation.jsonl"

OUTPUT_DIR = "./sparkling_qlora"

HF_TOKEN = os.getenv("HF_TOKEN")


# ============================================================
# ENVIRONMENT CHECK
# ============================================================

print("=" * 70)
print("SPARKLING QLoRA TRAINING")
print("=" * 70)

print("PyTorch:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))


# ============================================================
# LOAD DATASET
# ============================================================

print("\n" + "=" * 70)
print("LOADING DATASET")
print("=" * 70)

dataset = load_dataset(
    "json",
    data_files={
        "train": TRAIN_FILE,
        "validation": VALIDATION_FILE,
    },
)

print("Training records:", len(dataset["train"]))
print("Validation records:", len(dataset["validation"]))


# ============================================================
# TOKENIZER
# ============================================================

print("\n" + "=" * 70)
print("LOADING TOKENIZER")
print("=" * 70)

tokenizer = AutoTokenizer.from_pretrained(
    BASE_MODEL,
    token=HF_TOKEN,
)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

print("Tokenizer loaded")
print("EOS token:", tokenizer.eos_token)
print("PAD token:", tokenizer.pad_token)


# ============================================================
# 4-BIT QUANTIZATION
# ============================================================

print("\n" + "=" * 70)
print("CONFIGURING 4-BIT QUANTIZATION")
print("=" * 70)

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)


# ============================================================
# LOAD BASE MODEL
# ============================================================

print("\n" + "=" * 70)
print("LOADING LLAMA 3.2 3B")
print("=" * 70)

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    quantization_config=bnb_config,
    device_map="auto",
    token=HF_TOKEN,
)

model.config.use_cache = False

print("Base model loaded successfully")


# ============================================================
# LoRA CONFIGURATION
# ============================================================

print("\n" + "=" * 70)
print("CONFIGURING LoRA")
print("=" * 70)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj",
    ],
)

print("LoRA configuration ready")


# ============================================================
# TRAINING ARGUMENTS
# ============================================================

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,

    num_train_epochs=3,

    learning_rate=2e-4,

    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,

    gradient_accumulation_steps=8,

    gradient_checkpointing=True,

    warmup_steps=15,

    fp16=True,

    logging_steps=10,

    eval_strategy="epoch",
    save_strategy="epoch",

    save_total_limit=2,

    report_to="none",

    optim="paged_adamw_8bit",

    load_best_model_at_end=True,
)


# ============================================================
# SFT TRAINER
# ============================================================

print("\n" + "=" * 70)
print("STARTING SPARKLING FINE-TUNING")
print("=" * 70)

trainer = SFTTrainer(
    model=model,
    args=training_args,

    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],

    peft_config=lora_config,

    processing_class=tokenizer,

    dataset_text_field="text",

    max_seq_length=512,
)


# ============================================================
# TRAIN
# ============================================================

trainer.train()


# ============================================================
# SAVE ADAPTER
# ============================================================

print("\n" + "=" * 70)
print("SAVING SPARKLING LoRA ADAPTER")
print("=" * 70)

FINAL_ADAPTER = os.path.join(
    OUTPUT_DIR,
    "final_adapter"
)

trainer.save_model(FINAL_ADAPTER)
tokenizer.save_pretrained(FINAL_ADAPTER)

print("Adapter saved to:")
print(FINAL_ADAPTER)

print("\nTraining completed successfully.")
