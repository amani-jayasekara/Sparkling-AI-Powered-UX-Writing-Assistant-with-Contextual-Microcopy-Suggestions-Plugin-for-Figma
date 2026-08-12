import json
import os

from metrics import (
    calculate_exact_match,
    calculate_rouge_l,
    calculate_semantic_similarity,
)


# ============================================================
# PATHS
# ============================================================

PREDICTIONS_FILE = (
    "../sparkling_qlora/"
    "phase7_predictions.json"
)

OUTPUT_FILE = (
    "./phase7_final_results.json"
)


# ============================================================
# LOAD PREDICTIONS
# ============================================================

print("=" * 70)
print("SPARKLING MODEL EVALUATION")
print("=" * 70)

with open(
    PREDICTIONS_FILE,
    "r",
    encoding="utf-8"
) as file:

    predictions_data = json.load(file)


# ============================================================
# EXTRACT DATA
# ============================================================

predictions = []
references = []

for item in predictions_data:

    predictions.append(
        item["prediction"]
    )

    references.append(
        item["reference"]
    )


print("Records:", len(predictions))


# ============================================================
# EXACT MATCH
# ============================================================

exact_match = calculate_exact_match(
    predictions,
    references
)

print(
    f"Exact Match: {exact_match:.2f}%"
)


# ============================================================
# ROUGE-L
# ============================================================

rouge_l = calculate_rouge_l(
    predictions,
    references
)

print(
    f"ROUGE-L: {rouge_l:.2f}%"
)


# ============================================================
# SEMANTIC SIMILARITY
# ============================================================

semantic_similarity = calculate_semantic_similarity(
    predictions,
    references
)

print(
    f"Semantic Similarity: "
    f"{semantic_similarity:.2f}%"
)


# ============================================================
# SAVE RESULTS
# ============================================================

results = {

    "evaluation_dataset": "test.jsonl",

    "test_records": len(predictions),

    "fine_tuned": {

        "exact_match": round(
            exact_match,
            2
        ),

        "rouge_l": round(
            rouge_l,
            2
        ),

        "semantic_similarity": round(
            semantic_similarity,
            2
        ),
    }
}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        results,
        file,
        indent=2
    )


print("\n" + "=" * 70)
print("EVALUATION COMPLETED")
print("=" * 70)

print(
    "Results saved to:",
    OUTPUT_FILE
)
