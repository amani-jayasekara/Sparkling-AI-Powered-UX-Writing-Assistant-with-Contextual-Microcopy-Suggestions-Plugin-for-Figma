function validateMicrocopy(data) {

    const errors = [];

    if (!data.uiContext || data.uiContext.trim() === "") {
        errors.push("UI Context is required.");
    }

    if (!data.intent || data.intent.trim() === "") {
        errors.push("Intent is required.");
    }

    return errors;
}

module.exports = validateMicrocopy;