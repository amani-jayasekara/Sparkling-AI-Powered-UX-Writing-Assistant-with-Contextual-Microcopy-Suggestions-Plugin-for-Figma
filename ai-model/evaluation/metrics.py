import re

from rouge_score import rouge_scorer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# EXACT MATCH
# ============================================================

def normalize_text(text):

    text = str(text).strip().lower()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


def calculate_exact_match(
    predictions,
    references
):

    matches = 0

    for prediction, reference in zip(
        predictions,
        references
    ):

        if normalize_text(prediction) == normalize_text(reference):
            matches += 1

    if len(references) == 0:
        return 0.0

    return (
        matches /
        len(references)
    ) * 100


# ============================================================
# ROUGE-L
# ============================================================

def calculate_rouge_l(
    predictions,
    references
):

    scorer = rouge_scorer.RougeScorer(
        ["rougeL"],
        use_stemmer=True,
    )

    scores = []

    for prediction, reference in zip(
        predictions,
        references
    ):

        score = scorer.score(
            reference,
            prediction
        )

        scores.append(
            score["rougeL"].fmeasure
        )

    if not scores:
        return 0.0

    return (
        sum(scores) /
        len(scores)
    ) * 100


# ============================================================
# SEMANTIC SIMILARITY
# ============================================================

def calculate_semantic_similarity(
    predictions,
    references,
    model_name="all-MiniLM-L6-v2"
):

    semantic_model = SentenceTransformer(
        model_name
    )

    prediction_embeddings = semantic_model.encode(
        predictions,
        convert_to_numpy=True,
        show_progress_bar=True,
    )

    reference_embeddings = semantic_model.encode(
        references,
        convert_to_numpy=True,
        show_progress_bar=True,
    )

    similarities = []

    for prediction_embedding, reference_embedding in zip(
        prediction_embeddings,
        reference_embeddings
    ):

        similarity = cosine_similarity(
            [prediction_embedding],
            [reference_embedding]
        )[0][0]

        similarities.append(
            similarity
        )

    if not similarities:
        return 0.0

    return (
        sum(similarities) /
        len(similarities)
    ) * 100
