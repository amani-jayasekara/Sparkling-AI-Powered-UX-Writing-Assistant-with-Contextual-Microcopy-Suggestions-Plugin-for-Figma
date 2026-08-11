function validateContext(uiContext, suggestions) {

    const validSuggestions = [];

    const keywords = uiContext
        .toLowerCase()
        .split(" ");

    for (const suggestion of suggestions) {

        const lowerSuggestion = suggestion.toLowerCase();

        const isRelevant = keywords.some(keyword =>
            lowerSuggestion.includes(keyword)
        );

        if (isRelevant) {
            validSuggestions.push(suggestion);
        }
    }

    return validSuggestions;
}

module.exports = validateContext;