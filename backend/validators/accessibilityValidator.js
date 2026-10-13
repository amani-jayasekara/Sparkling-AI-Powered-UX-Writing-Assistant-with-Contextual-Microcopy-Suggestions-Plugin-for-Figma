function validateAccessibility(suggestions) {

    const accessibleSuggestions = [];

    // Difficult words to avoid
    const difficultWords = [
        "authentication",
        "credentials",
        "configuration",
        "authorization"
    ];

    // Make sure suggestions is an array
    if (!Array.isArray(suggestions)) {
        return [];
    }

    for (const suggestion of suggestions) {

        // Make sure suggestion is a string
        if (typeof suggestion !== "string") {
            continue;
        }

        const text = suggestion.trim();

        // Skip empty suggestions
        if (text === "") {
            continue;
        }

        // Rule 1: Maximum 80 characters
        if (text.length > 80) {
            continue;
        }

        // Rule 2: Avoid difficult technical words
        const lowerSuggestion = text.toLowerCase();

        const hasDifficultWord = difficultWords.some(
            word => lowerSuggestion.includes(word)
        );

        if (hasDifficultWord) {
            continue;
        }

        // Rule 3: Keep valid suggestion
        accessibleSuggestions.push(text);
    }

    return accessibleSuggestions;
}

module.exports = validateAccessibility;