\# Sparkling AI Model



\## Overview



The Sparkling AI model is a context-aware UX microcopy generation model developed for the Sparkling UX Writing Assistant.



The model generates concise UX microcopy based on UI context, intent, persona, tone, and accessibility requirements.



\## Base Model



\- Llama 3.2 3B Instruct



\## Fine-Tuning



\- QLoRA

\- 4-bit quantization

\- NF4 quantization

\- 3 training epochs



\## Dataset



| Dataset | Records | Purpose |

|---|---:|---|

| Training | 2,610 | Model fine-tuning |

| Validation | 126 | Validation during training |

| Test | 144 | Final evaluation |



\## Evaluation



| Metric | Baseline | Fine-tuned | Improvement |

|---|---:|---:|---:|

| Exact Match | 6.25% | 33.33% | +27.08 pp |

| ROUGE-L | 53.64% | 58.83% | +5.19 pp |

| Semantic Similarity | 68.13% | 73.21% | +5.08 pp |



\## Model Artifact



The trained LoRA adapter is stored separately from this source repository.



The repository contains the training, inference, evaluation, and API code used by the Sparkling AI component.

