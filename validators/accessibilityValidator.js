function validateAccessibility(suggestions) {

    const accessibleSuggestions = [];

    for (const suggestion of suggestions) {

        // Rule 1: Maximum 80 characters
        if (suggestion.length > 80) {
            continue;
        }

        // Rule 2: Avoid difficult words
        const difficultWords = [
            "authentication",
            "credentials",
            "configuration",
            "authorization"
        ];

        const lowerSuggestion = suggestion.toLowerCase();

        const hasDifficultWord = difficultWords.some(word =>
            lowerSuggestion.includes(word)
        );

        if (hasDifficultWord) {
            continue;
        }

        // Rule 3: Keep the suggestion
        accessibleSuggestions.push(suggestion);
    }

    return accessibleSuggestions;
}

module.exports = validateAccessibility;