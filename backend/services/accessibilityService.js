// =====================================================
// ACCESSIBILITY / WCAG MICROCOPY SCORING
// =====================================================

function calculateAccessibilityScore(text) {

    if (!text || !text.trim()) {
        return 0;
    }

    const suggestion = text.trim();

    let score = 100;

    // ---------------------------------------------
    // 1. Length check
    // ---------------------------------------------
    if (suggestion.length > 80) {
        score -= 30;
    }

    // ---------------------------------------------
    // 2. Avoid difficult / technical words
    // ---------------------------------------------
    const difficultWords = [
        "authentication",
        "credentials",
        "configuration",
        "authorization",
        "verification",
        "utilization",
        "implementation",
        "functionality",
        "optimization"
    ];

    const lowerText = suggestion.toLowerCase();

    difficultWords.forEach(word => {
        if (lowerText.includes(word)) {
            score -= 10;
        }
    });

    // ---------------------------------------------
    // 3. Avoid vague language
    // ---------------------------------------------
    const vagueWords = [
        "thing",
        "stuff",
        "something",
        "etc",
        "process"
    ];

    vagueWords.forEach(word => {
        if (lowerText.includes(word)) {
            score -= 5;
        }
    });

    // ---------------------------------------------
    // 4. Check sentence clarity
    // ---------------------------------------------
    if (suggestion.length < 3) {
        score -= 20;
    }

    // ---------------------------------------------
    // 5. Excessive punctuation
    // ---------------------------------------------
    if (/!{2,}|\?{2,}/.test(suggestion)) {
        score -= 5;
    }

    // ---------------------------------------------
    // 6. Excessive capital letters
    // ---------------------------------------------
    const letters = suggestion.replace(/[^a-zA-Z]/g, "");

    if (letters.length > 5) {
        const uppercaseLetters =
            letters.replace(/[^A-Z]/g, "").length;

        const uppercaseRatio =
            uppercaseLetters / letters.length;

        if (uppercaseRatio > 0.6) {
            score -= 10;
        }
    }

    // ---------------------------------------------
    // Keep score between 0 and 100
    // ---------------------------------------------
    score = Math.max(0, Math.min(100, score));

    return score;
}

module.exports = {
    calculateAccessibilityScore
};