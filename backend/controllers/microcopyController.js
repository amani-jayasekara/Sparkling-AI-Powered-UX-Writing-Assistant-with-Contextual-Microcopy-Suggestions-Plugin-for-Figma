const Microcopy = require("../models/Microcopy");
const aiService = require("../services/aiService");
const MicrocopyVersion = require("../models/MicrocopyVersion");

const {
    calculateAccessibilityScore
} = require("../services/accessibilityService");


// =====================================================
// FR-20 — GENERATE MICROCOPY
// =====================================================

exports.generateMicrocopy = async (req, res) => {

    try {

        console.log("========================================");
        console.log("NEW GENERATE CONTROLLER");
        console.log("REQUEST BODY:");
        console.log(req.body);
        console.log("========================================");


        const {
            uiContext,
            intent,
            tone,
            persona,
            designerId,
            elementId,
            elementName,
            elementType,
            originalText,
            microcopyType
        } = req.body;


        // ---------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------

        if (!uiContext || !uiContext.trim()) {

            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MICROCOPY_REQUEST",
                    message: "UI Context is required."
                }
            });

        }


        if (!intent || !intent.trim()) {

            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MICROCOPY_REQUEST",
                    message: "Intent is required."
                }
            });

        }


        if (!tone || !tone.trim()) {

            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MICROCOPY_REQUEST",
                    message: "Tone is required."
                }
            });

        }


        if (!persona || !persona.trim()) {

            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MICROCOPY_REQUEST",
                    message: "Persona is required."
                }
            });

        }


        console.log("VALIDATION PASSED");


        // ---------------------------------------------
        // CALL AI BACKEND
        // ---------------------------------------------

        console.log("CALLING AI BACKEND...");


        const aiResponse = await aiService.generate({

            uiContext,
            intent,
            tone,
            persona

        });


        console.log("AI BACKEND RESPONSE:");
        console.log(aiResponse);


        // ---------------------------------------------
        // EXTRACT SUGGESTIONS
        // ---------------------------------------------

        let suggestions = [];


        if (Array.isArray(aiResponse)) {

            suggestions = aiResponse;

        }

        else if (
            aiResponse &&
            Array.isArray(aiResponse.suggestions)
        ) {

            suggestions = aiResponse.suggestions;

        }


        console.log("SUGGESTIONS:");
        console.log(suggestions);


        // ---------------------------------------------
        // CHECK AI RESPONSE
        // ---------------------------------------------

        if (!suggestions.length) {

            return res.status(500).json({
                success: false,
                error: {
                    code: "AI_GENERATION_FAILED",
                    message:
                        "AI backend returned no microcopy suggestions."
                }
            });

        }


        // ---------------------------------------------
        // CLEAN SUGGESTIONS
        // ---------------------------------------------

        suggestions = suggestions
            .map(item => String(item).trim())
            .filter(item => item.length > 0)
            .slice(0, 3);


        console.log("FINAL SUGGESTIONS:");
        console.log(suggestions);


        // ---------------------------------------------
        // FIRST GENERATED SUGGESTION
        // ---------------------------------------------

        const generatedText =
            suggestions[0];


        // ---------------------------------------------
        // CALCULATE ACCESSIBILITY SCORE
        // ---------------------------------------------

        const wcagScore =
            calculateAccessibilityScore(generatedText);


        console.log(
            "ACCESSIBILITY SCORE:",
            wcagScore
        );


        // ---------------------------------------------
        // SAVE TO DATABASE
        // ---------------------------------------------

        const microcopyId =
            await Microcopy.create(
                uiContext,
                intent,
                tone,
                persona,
                generatedText,
                wcagScore,
                {
                    designerId,
                    elementId,
                    elementName,
                    originalText,
                    suggestions
                }
            );


        console.log(
            "MICROCOPY SAVED. ID:",
            microcopyId
        );


        // ---------------------------------------------
        // SUCCESS RESPONSE
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            data: {

                id: microcopyId,

                microcopyId: microcopyId,

                uiContext: uiContext,

                intent: intent,

                tone: tone,

                persona: persona,

                designerId: designerId || null,
                elementId: elementId || null,
                elementName: elementName || null,
                elementType: elementType || null,
                originalText: originalText || "",
                microcopyType: microcopyType || null,

                suggestions: suggestions,

                selectedSuggestion:
                    generatedText,

                generatedText:
                    generatedText,

                wcagScore:
                    wcagScore

            }

        });


    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "GENERATE MICROCOPY ERROR"
        );

        console.error(error);

        console.error(
            "========================================"
        );


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "MICROCOPY_GENERATION_ERROR",

                message:
                    "Failed to generate microcopy.",

                details:
                    error.message

            }

        });

    }

};


// =====================================================
// HISTORY
// =====================================================

exports.getAllMicrocopy = async (req, res) => {

    try {

        const rows =
            await Microcopy.getAll();


        return res.status(200).json({

            success: true,

            data: rows

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "HISTORY_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// SELECT MICROCOPY
// =====================================================

exports.selectMicrocopyOption = async (req, res) => {

    try {

        const { id } = req.params;

        const { selectedText } = req.body;


        if (!selectedText || !selectedText.trim()) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "INVALID_SELECTION",

                    message:
                        "Selected microcopy is required."

                }

            });

        }


        const existing =
            await Microcopy.getById(id);


        if (!existing) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        const selectedSuggestion =
            selectedText.trim();


        // ---------------------------------------------
        // RECALCULATE ACCESSIBILITY SCORE
        // ---------------------------------------------

        const wcagScore =
            calculateAccessibilityScore(
                selectedSuggestion
            );


        await Microcopy.selectOption(
            id,
            selectedSuggestion
        );


        // Save updated score

        await Microcopy.updateWcagScore(
            id,
            wcagScore
        );


        return res.status(200).json({

            success: true,

            data: {

                id: Number(id),

                selectedSuggestion:
                    selectedSuggestion,

                generatedText:
                    selectedSuggestion,

                wcagScore:
                    wcagScore

            }

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "SELECTION_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// REGENERATE MICROCOPY
// =====================================================

exports.regenerateMicrocopy = async (req, res) => {

    try {

        const { id } = req.params;


        console.log("========================================");
        console.log("REGENERATE MICROCOPY");
        console.log("MICROCOPY ID:", id);
        console.log("========================================");


        // ---------------------------------------------
        // GET EXISTING MICROCOPY
        // ---------------------------------------------

        const existing =
            await Microcopy.getById(id);


        if (!existing) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        console.log(
            "EXISTING MICROCOPY:"
        );

        console.log(existing);


        // ---------------------------------------------
        // GET PREVIOUS GENERATED TEXT
        // ---------------------------------------------

        /*
         * The first generated suggestion is stored
         * in generated_text by Microcopy.create().
         *
         * During regeneration we send this existing
         * suggestion to the AI backend so the temporary
         * generator can produce different alternatives.
         */

        const previousSuggestion =
            existing.generated_text || "";


        console.log(
            "PREVIOUS SUGGESTION:"
        );

        console.log(
            previousSuggestion
        );


        // ---------------------------------------------
        // CALL AI BACKEND
        // ---------------------------------------------

        const aiRequest = {

            uiContext:
                existing.ui_context,

            intent:
                existing.intent,

            tone:
                existing.tone,

            persona:
                existing.persona,

            previous_suggestions:
                previousSuggestion
                    ? [previousSuggestion]
                    : []

        };


        console.log(
            "========== REGENERATION AI REQUEST =========="
        );

        console.log(aiRequest);


        const aiResponse =
            await aiService.generate(
                aiRequest
            );


        console.log(
            "========== AI REGENERATION RESPONSE =========="
        );

        console.log(aiResponse);


        // ---------------------------------------------
        // EXTRACT SUGGESTIONS
        // ---------------------------------------------

        let suggestions = [];


        if (Array.isArray(aiResponse)) {

            suggestions = aiResponse;

        }

        else if (
            aiResponse &&
            Array.isArray(aiResponse.suggestions)
        ) {

            suggestions =
                aiResponse.suggestions;

        }


        // ---------------------------------------------
        // CLEAN SUGGESTIONS
        // ---------------------------------------------

        suggestions = suggestions

            .map(
                item =>
                    String(item).trim()
            )

            .filter(
                Boolean
            )

            .slice(0, 3);


        console.log(
            "REGENERATED SUGGESTIONS:"
        );

        console.log(
            suggestions
        );


        // ---------------------------------------------
        // CHECK RESULT
        // ---------------------------------------------

        if (!suggestions.length) {

            return res.status(500).json({

                success: false,

                error: {

                    code:
                        "REGENERATION_FAILED",

                    message:
                        "No suggestions returned."

                }

            });

        }


        // ---------------------------------------------
        // FIRST NEW GENERATED SUGGESTION
        // ---------------------------------------------

        const generatedText =
            suggestions[0];


        // ---------------------------------------------
        // CALCULATE ACCESSIBILITY SCORE
        // ---------------------------------------------

        const wcagScore =
            calculateAccessibilityScore(
                generatedText
            );


        console.log(
            "NEW GENERATED TEXT:"
        );

        console.log(
            generatedText
        );


        console.log(
            "NEW WCAG SCORE:"
        );

        console.log(
            wcagScore
        );


        // ---------------------------------------------
        // SAVE NEW MICROCOPY
        // ---------------------------------------------

        await Microcopy.replaceOptions(
            id,
            generatedText
        );


        await Microcopy.updateWcagScore(
            id,
            wcagScore
        );


        // ---------------------------------------------
        // SUCCESS RESPONSE
        // ---------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "REGENERATION COMPLETE"
        );

        console.log(
            "========================================"
        );


        return res.status(200).json({

            success: true,

            data: {

                id:
                    Number(id),

                suggestions:
                    suggestions,

                selectedSuggestion:
                    generatedText,

                generatedText:
                    generatedText,

                wcagScore:
                    wcagScore

            }

        });


    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "REGENERATION ERROR"
        );

        console.error(error);

        console.error(
            "========================================"
        );


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "REGENERATION_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// REPLACE
// =====================================================

exports.replaceMicrocopyOptions = async (req, res) => {

    try {

        const { id } = req.params;

        const { generatedText } = req.body;


        if (!generatedText || !generatedText.trim()) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "INVALID_REPLACEMENT",

                    message:
                        "Replacement microcopy is required."

                }

            });

        }


        if (generatedText.trim().length > 80) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_TOO_LONG",

                    message:
                        "Microcopy must be 80 characters or less."

                }

            });

        }


        const existing =
            await Microcopy.getById(id);


        if (!existing) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        const replacement =
            generatedText.trim();


        // ---------------------------------------------
        // CALCULATE ACCESSIBILITY SCORE
        // ---------------------------------------------

        const wcagScore =
            calculateAccessibilityScore(
                replacement
            );


        await Microcopy.replaceOptions(
            id,
            replacement
        );


        await Microcopy.updateWcagScore(
            id,
            wcagScore
        );


        return res.status(200).json({

            success: true,

            data: {

                id: Number(id),

                generatedText:
                    replacement,

                selectedSuggestion:
                    replacement,

                wcagScore:
                    wcagScore

            }

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "REPLACEMENT_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

exports.exportMicrocopy = async (req, res) => {

    try {

        const { id } = req.params;


        const microcopy =
            await Microcopy.getById(id);


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        return res.status(200).json({

            success: true,

            data: microcopy

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "EXPORT_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// PREVIEW
// =====================================================

exports.previewMicrocopy = async (req, res) => {

    try {

        const { id } = req.params;


        const microcopy =
            await Microcopy.getById(id);


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        return res.status(200).json({

            success: true,

            data: microcopy

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "PREVIEW_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// RETRY
// =====================================================

exports.retryMicrocopy = async (req, res) => {

    return exports.regenerateMicrocopy(req, res);

};


// =====================================================
// CONFIRM PREVIEW
// =====================================================

exports.confirmPreview = async (req, res) => {

    try {

        const { id } = req.params;


        const microcopy =
            await Microcopy.getById(id);


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Microcopy preview confirmed.",

            data: microcopy

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "CONFIRM_PREVIEW_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// DISCARD PREVIEW
// =====================================================

exports.discardPreview = async (req, res) => {

    try {

        const { id } = req.params;


        return res.status(200).json({

            success: true,

            message:
                "Microcopy preview discarded.",

            data: {

                id: Number(id)

            }

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "DISCARD_PREVIEW_ERROR",

                message:
                    error.message

            }

        });

    }

};


// =====================================================
// EDIT
// =====================================================

exports.editMicrocopy = async (req, res) => {

    try {

        const { id } = req.params;

        const { generatedText } = req.body;


        if (!generatedText || !generatedText.trim()) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "INVALID_EDIT",

                    message:
                        "Microcopy text is required."

                }

            });

        }


        if (generatedText.trim().length > 80) {

            return res.status(400).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_TOO_LONG",

                    message:
                        "Microcopy must be 80 characters or less."

                }

            });

        }


        const existing =
            await Microcopy.getById(id);


        if (!existing) {

            return res.status(404).json({

                success: false,

                error: {

                    code:
                        "MICROCOPY_NOT_FOUND",

                    message:
                        "Microcopy not found."

                }

            });

        }


        const editedText =
            generatedText.trim();


        // ---------------------------------------------
        // CALCULATE ACCESSIBILITY SCORE
        // ---------------------------------------------

        const wcagScore =
            calculateAccessibilityScore(
                editedText
            );


        await Microcopy.replaceOptions(
            id,
            editedText
        );


        await Microcopy.updateWcagScore(
            id,
            wcagScore
        );


        return res.status(200).json({

            success: true,

            data: {

                id: Number(id),

                generatedText:
                    editedText,

                wcagScore:
                    wcagScore

            }

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            success: false,

            error: {

                code:
                    "EDIT_ERROR",

                message:
                    error.message

            }

        });

    }

};

exports.getUserHistory = async (req, res) => {

    try {

        const {
            designerId
        } = req.params;

        if (!designerId) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_DESIGNER_ID",
                    message:
                        "designerId is required"
                }

            });

        }

        const history =
            await Microcopy.getByDesignerId(
                designerId
            );

        return res.status(200).json({

            success: true,

            count: history.length,

            data: history

        });

    } catch (error) {

        console.error(
            "User history error:",
            error
        );

        return res.status(500).json({

            success: false,

            error: {
                code:
                    "HISTORY_RETRIEVAL_FAILED",

                message:
                    error.message
            }

        });

    }

};

// =====================================================
// SAVE APPLIED VERSION
// Used by the Figma plugin when text is actually applied.
// =====================================================

exports.saveMicrocopyVersion = async (req, res) => {
    try {
        const {
            microcopyId,
            designerId,
            elementId,
            previousText,
            newText,
            action = "apply"
        } = req.body;

        if (!elementId || !String(elementId).trim()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_ELEMENT_ID",
                    message: "elementId is required."
                }
            });
        }

        if (!newText || !String(newText).trim()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_NEW_TEXT",
                    message: "newText is required."
                }
            });
        }

        const versionId = await MicrocopyVersion.create({
            microcopyId: microcopyId || null,
            designerId: designerId || null,
            elementId: String(elementId),
            previousText: previousText || "",
            newText: String(newText).trim(),
            action
        });

        return res.status(201).json({
            success: true,
            data: {
                versionId,
                microcopyId: microcopyId ? Number(microcopyId) : null,
                designerId: designerId || null,
                elementId: String(elementId),
                previousText: previousText || "",
                newText: String(newText).trim(),
                action
            }
        });
    } catch (error) {
        console.error("SAVE VERSION ERROR:", error);

        return res.status(500).json({
            success: false,
            error: {
                code: "VERSION_SAVE_ERROR",
                message: error.message
            }
        });
    }
};


// =====================================================
// GET VERSION HISTORY FOR ONE USER
// =====================================================

exports.getUserVersionHistory = async (req, res) => {
    try {
        const { designerId } = req.params;

        if (!designerId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_DESIGNER_ID",
                    message: "designerId is required."
                }
            });
        }

        const rows =
            await MicrocopyVersion.getByDesignerId(designerId);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("VERSION HISTORY ERROR:", error);

        return res.status(500).json({
            success: false,
            error: {
                code: "VERSION_HISTORY_ERROR",
                message: error.message
            }
        });
    }
};
