const validateMicrocopy = require("../validators/microcopyValidator");
const validateContext = require("../validators/contextValidator");
const validateAccessibility = require("../validators/accessibilityValidator");

const aiService = require("../services/aiService");

const Microcopy = require("../models/Microcopy");
const History = require("../models/History");
const MicrocopyPreview = require("../models/MicrocopyPreview");

const sendError = require("../utils/errorResponse");


// ============================================================
// FR-16 / FR-17 / FR-18 / FR-19 / FR-20
// Generate Microcopy Options
// ============================================================

exports.generateMicrocopy = async (req, res) => {

    console.log("========== INSIDE MICROCOPY CONTROLLER ==========");

    try {

        console.log("========== REQUEST BODY ==========");
        console.log(req.body);


        // ----------------------------------------------------
        // Check request body
        // ----------------------------------------------------

        if (!req.body) {

            return sendError(
                res,
                400,
                "MISSING_REQUEST_BODY",
                "Request body is required"
            );

        }


        const uiContext = req.body.uiContext;
        const intent = req.body.intent;


        // FR-13 / FR-14 / FR-15
        const tone =
            req.body.tone || "Friendly";

        const persona =
            req.body.persona || "General User";


        console.log("DEFAULT VALUES:", {
            tone,
            persona
        });


        // ----------------------------------------------------
        // Validate microcopy request
        // ----------------------------------------------------

        const errors = validateMicrocopy({
            ...req.body,
            tone,
            persona
        });


        if (errors.length > 0) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_REQUEST",
                "Invalid microcopy request",
                errors
            );

        }


        // ----------------------------------------------------
        // Send request to AI
        // ----------------------------------------------------

        console.log(
            "========== SENDING TO AI =========="
        );

        console.log({
            uiContext,
            intent,
            tone,
            persona
        });


        const aiResponse =
            await aiService.generate({

                uiContext,
                intent,
                tone,
                persona

            });


        console.log(
            "========== AI RESPONSE =========="
        );

        console.log(aiResponse);


        const suggestions =
            aiResponse.suggestions;


        // ----------------------------------------------------
        // FR-18 — Validate Context Relevance
        // ----------------------------------------------------

        const validSuggestions =
            validateContext(
                uiContext,
                suggestions
            );


        // ----------------------------------------------------
        // FR-19 — Validate Accessibility
        // ----------------------------------------------------

        const accessibleSuggestions =
            validateAccessibility(
                validSuggestions
            );


        // ----------------------------------------------------
        // Check suggestions
        // ----------------------------------------------------

        if (
            !accessibleSuggestions ||
            accessibleSuggestions.length === 0
        ) {

            return sendError(
                res,
                500,
                "NO_VALID_SUGGESTIONS",
                "No valid microcopy suggestions generated"
            );

        }


        // ----------------------------------------------------
        // Save first suggestion
        // ----------------------------------------------------

        const generatedText =
            accessibleSuggestions[0];


        // ----------------------------------------------------
        // Save to database
        // ----------------------------------------------------

        const id =
            await Microcopy.create(
                uiContext,
                intent,
                tone,
                persona,
                generatedText,
                null
            );


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            id,
            "generate"
        );


        console.log(
            "========== SAVED TO DATABASE =========="
        );

        console.log(
            "Inserted Microcopy ID:",
            id
        );

        console.log(
            "History saved for Microcopy ID:",
            id
        );


        // ----------------------------------------------------
        // FR-20 — Display Microcopy Options
        // ----------------------------------------------------

        return res.status(200).json({

            id,

            suggestions:
                accessibleSuggestions

        });


    } catch (err) {

        console.log(
            "========== AI ERROR =========="
        );

        console.error(err);


        if (err.response) {

            console.log(
                "Status:",
                err.response.status
            );

            console.log(
                "Data:",
                err.response.data
            );

        }


        return sendError(
            res,
            503,
            "AI_SERVICE_UNAVAILABLE",
            "Microcopy generation service is currently unavailable"
        );

    }

};



// ============================================================
// Get All Saved Microcopy
// ============================================================

exports.getAllMicrocopy = async (req, res) => {

    try {

        const microcopy =
            await Microcopy.getAll();


        return res.status(200).json({

            microcopy

        });


    } catch (err) {

        console.error(
            "Get microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "MICROCOPY_HISTORY_FAILED",
            "Failed to retrieve microcopy"
        );

    }

};



// ============================================================
// FR-21 — Select Microcopy Option
// ============================================================

exports.selectMicrocopyOption = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        const {
            selectedOption,
            selectedText
        } = req.body;


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Validate selected option
        // ----------------------------------------------------

        if (
            selectedOption === undefined ||
            selectedOption === null
        ) {

            return sendError(
                res,
                400,
                "MISSING_SELECTED_OPTION",
                "selectedOption is required"
            );

        }


        // ----------------------------------------------------
        // Only 3 options
        // ----------------------------------------------------

        if (
            ![0, 1, 2].includes(
                Number(selectedOption)
            )
        ) {

            return sendError(
                res,
                400,
                "INVALID_SELECTED_OPTION",
                "selectedOption must be 0, 1, or 2"
            );

        }


        // ----------------------------------------------------
        // Find microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        // ----------------------------------------------------
        // Save selected text
        // ----------------------------------------------------

        if (
            selectedText &&
            selectedText.trim() !== ""
        ) {

            const updated =
                await Microcopy.selectOption(
                    microcopyId,
                    selectedText.trim()
                );


            if (updated === 0) {

                return sendError(
                    res,
                    404,
                    "MICROCOPY_UPDATE_FAILED",
                    "Microcopy could not be updated"
                );

            }

        }


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "select"
        );


        return res.status(200).json({

            message:
                "Microcopy option selected successfully",

            microcopyId,

            selectedOption:
                Number(selectedOption),

            selectedText:
                selectedText &&
                selectedText.trim() !== ""
                    ? selectedText.trim()
                    : microcopy.generated_text

        });


    } catch (err) {

        console.error(
            "Select microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "SELECT_MICROCOPY_FAILED",
            "Failed to select microcopy option"
        );

    }

};



// ============================================================
// FR-22 — Request Regeneration
// ============================================================

exports.regenerateMicrocopy = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Get existing microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        console.log(
            "========== REGENERATING MICROCOPY =========="
        );


        console.log({

            uiContext:
                microcopy.ui_context,

            intent:
                microcopy.intent,

            tone:
                microcopy.tone,

            persona:
                microcopy.persona

        });


        // ----------------------------------------------------
        // Call AI again
        // ----------------------------------------------------

        const aiResponse =
            await aiService.generate({

                uiContext:
                    microcopy.ui_context,

                intent:
                    microcopy.intent,

                tone:
                    microcopy.tone,

                persona:
                    microcopy.persona

            });


        console.log(
            "========== NEW AI RESPONSE =========="
        );

        console.log(aiResponse);


        const suggestions =
            aiResponse.suggestions;


        // ----------------------------------------------------
        // FR-18 — Validate Context
        // ----------------------------------------------------

        const validSuggestions =
            validateContext(
                microcopy.ui_context,
                suggestions
            );


        // ----------------------------------------------------
        // FR-19 — Validate Accessibility
        // ----------------------------------------------------

        const accessibleSuggestions =
            validateAccessibility(
                validSuggestions
            );


        if (
            !accessibleSuggestions ||
            accessibleSuggestions.length === 0
        ) {

            return sendError(
                res,
                500,
                "NO_VALID_REGENERATED_SUGGESTIONS",
                "No valid regenerated suggestions"
            );

        }


        // ----------------------------------------------------
        // Save first regenerated suggestion
        // ----------------------------------------------------

        const replacementText =
            accessibleSuggestions[0];


        // ----------------------------------------------------
        // Replace existing microcopy
        // ----------------------------------------------------

        const updated =
            await Microcopy.replaceOptions(
                microcopyId,
                replacementText
            );


        if (updated === 0) {

            return sendError(
                res,
                404,
                "MICROCOPY_REPLACE_FAILED",
                "Microcopy could not be replaced"
            );

        }


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "regenerate"
        );


        console.log(
            "========== MICROCOPY REGENERATED =========="
        );


        return res.status(200).json({

            message:
                "Microcopy options regenerated successfully",

            microcopyId,

            suggestions:
                accessibleSuggestions

        });


    } catch (err) {

        console.error(
            "Regeneration error:",
            err
        );


        if (err.response) {

            console.error(
                "AI Status:",
                err.response.status
            );

            console.error(
                "AI Data:",
                err.response.data
            );

        }


        return sendError(
            res,
            503,
            "REGENERATION_FAILED",
            "Microcopy regeneration failed"
        );

    }

};



// ============================================================
// FR-23 — Replace Microcopy Options
// ============================================================

exports.replaceMicrocopyOptions = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        const {
            generatedText
        } = req.body;


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Validate text
        // ----------------------------------------------------

        if (
            !generatedText ||
            generatedText.trim() === ""
        ) {

            return sendError(
                res,
                400,
                "MISSING_GENERATED_TEXT",
                "generatedText is required"
            );

        }


        // ----------------------------------------------------
        // Find microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        // ----------------------------------------------------
        // Replace text
        // ----------------------------------------------------

        const updated =
            await Microcopy.replaceOptions(
                microcopyId,
                generatedText.trim()
            );


        if (updated === 0) {

            return sendError(
                res,
                404,
                "MICROCOPY_REPLACE_FAILED",
                "Microcopy could not be replaced"
            );

        }


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "replace"
        );


        return res.status(200).json({

            message:
                "Microcopy replaced successfully",

            microcopyId,

            generatedText:
                generatedText.trim()

        });


    } catch (err) {

        console.error(
            "Replace microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "REPLACE_MICROCOPY_FAILED",
            "Failed to replace microcopy"
        );

    }

};



// ============================================================
// FR-24 — Preview Microcopy
// ============================================================

exports.previewMicrocopy = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Find microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        // ----------------------------------------------------
        // Create preview
        // ----------------------------------------------------

        const previewId =
            await MicrocopyPreview.create(
                microcopyId,
                microcopy.generated_text
            );


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "preview"
        );


        return res.status(200).json({

            message:
                "Microcopy preview created successfully",

            previewId,

            microcopyId,

            preview: {

                text:
                    microcopy.generated_text,

                status:
                    "pending"

            }

        });


    } catch (err) {

        console.error(
            "Preview microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "PREVIEW_MICROCOPY_FAILED",
            "Failed to preview microcopy"
        );

    }

};



// ============================================================
// FR-25 — Confirm Preview
// ============================================================

exports.confirmPreview = async (req, res) => {

    try {

        const previewId =
            parseInt(req.params.previewId);


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !previewId ||
            isNaN(previewId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_PREVIEW_ID",
                "Valid preview ID is required"
            );

        }


        // ----------------------------------------------------
        // Confirm preview
        // ----------------------------------------------------

        const updated =
            await MicrocopyPreview.confirm(
                previewId
            );


        if (updated === 0) {

            return sendError(
                res,
                404,
                "PREVIEW_NOT_FOUND",
                "Preview not found"
            );

        }


        return res.status(200).json({

            message:
                "Microcopy preview confirmed successfully",

            previewId,

            status:
                "confirmed"

        });


    } catch (err) {

        console.error(
            "Confirm preview error:",
            err
        );


        return sendError(
            res,
            500,
            "CONFIRM_PREVIEW_FAILED",
            "Failed to confirm preview"
        );

    }

};



// ============================================================
// FR-26 — Discard Preview
// ============================================================

exports.discardPreview = async (req, res) => {

    try {

        const previewId =
            parseInt(req.params.previewId);


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !previewId ||
            isNaN(previewId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_PREVIEW_ID",
                "Valid preview ID is required"
            );

        }


        // ----------------------------------------------------
        // Discard preview
        // ----------------------------------------------------

        const updated =
            await MicrocopyPreview.discard(
                previewId
            );


        if (updated === 0) {

            return sendError(
                res,
                404,
                "PREVIEW_NOT_FOUND",
                "Preview not found"
            );

        }


        return res.status(200).json({

            message:
                "Microcopy preview discarded successfully",

            previewId,

            status:
                "discarded"

        });


    } catch (err) {

        console.error(
            "Discard preview error:",
            err
        );


        return sendError(
            res,
            500,
            "DISCARD_PREVIEW_FAILED",
            "Failed to discard preview"
        );

    }

};



// ============================================================
// FR-27 — Export Microcopy
// ============================================================

exports.exportMicrocopy = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Find microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        // ----------------------------------------------------
        // Save export history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "export"
        );


        // ----------------------------------------------------
        // Export response
        // ----------------------------------------------------

        return res.status(200).json({

            message:
                "Microcopy exported successfully",

            microcopyId,

            export: {

                text:
                    microcopy.generated_text,

                uiContext:
                    microcopy.ui_context,

                intent:
                    microcopy.intent,

                tone:
                    microcopy.tone,

                persona:
                    microcopy.persona,

                wcagScore:
                    microcopy.wcag_score,

                createdAt:
                    microcopy.created_at

            }

        });


    } catch (err) {

        console.error(
            "Export microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "EXPORT_MICROCOPY_FAILED",
            "Failed to export microcopy"
        );

    }

};



// ============================================================
// FR-28 — Edit Microcopy Manually
// ============================================================

exports.editMicrocopy = async (req, res) => {

    try {

        const microcopyId =
            parseInt(req.params.id);


        const {
            editedText
        } = req.body;


        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (
            !microcopyId ||
            isNaN(microcopyId)
        ) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }


        // ----------------------------------------------------
        // Validate edited text
        // ----------------------------------------------------

        if (
            !editedText ||
            editedText.trim() === ""
        ) {

            return sendError(
                res,
                400,
                "MISSING_EDITED_TEXT",
                "editedText is required"
            );

        }


        // ----------------------------------------------------
        // Find microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }


        // ----------------------------------------------------
        // Update microcopy
        // ----------------------------------------------------

        const updated =
            await Microcopy.replaceOptions(
                microcopyId,
                editedText.trim()
            );


        if (updated === 0) {

            return sendError(
                res,
                404,
                "MICROCOPY_UPDATE_FAILED",
                "Microcopy could not be updated"
            );

        }


        // ----------------------------------------------------
        // Save history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "edit"
        );


        return res.status(200).json({

            message:
                "Microcopy edited successfully",

            microcopyId,

            editedText:
                editedText.trim()

        });


    } catch (err) {

        console.error(
            "Edit microcopy error:",
            err
        );


        return sendError(
            res,
            500,
            "EDIT_MICROCOPY_FAILED",
            "Failed to edit microcopy"
        );

    }

};

// ============================================================
// FR-30 — Allow Retry After Failure
// ============================================================

exports.retryMicrocopy = async (req, res) => {

    try {

        const microcopyId = parseInt(req.params.id);

        // ----------------------------------------------------
        // Validate ID
        // ----------------------------------------------------

        if (!microcopyId || isNaN(microcopyId)) {

            return sendError(
                res,
                400,
                "INVALID_MICROCOPY_ID",
                "Valid microcopy ID is required"
            );

        }

        // ----------------------------------------------------
        // Find existing microcopy
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(microcopyId);

        if (!microcopy) {

            return sendError(
                res,
                404,
                "MICROCOPY_NOT_FOUND",
                "Microcopy not found"
            );

        }

        console.log(
            "========== FR-30 RETRY MICROCOPY =========="
        );

        console.log({
            microcopyId,
            uiContext: microcopy.ui_context,
            intent: microcopy.intent,
            tone: microcopy.tone,
            persona: microcopy.persona
        });

        // ----------------------------------------------------
        // Try AI generation again
        // ----------------------------------------------------

        const aiResponse =
            await aiService.generate({

                uiContext: microcopy.ui_context,

                intent: microcopy.intent,

                tone: microcopy.tone,

                persona: microcopy.persona

            });

        console.log(
            "========== RETRY AI RESPONSE =========="
        );

        console.log(aiResponse);

        // ----------------------------------------------------
        // Get suggestions
        // ----------------------------------------------------

        const suggestions =
            aiResponse.suggestions;

        if (
            !suggestions ||
            !Array.isArray(suggestions) ||
            suggestions.length === 0
        ) {

            return sendError(
                res,
                500,
                "NO_RETRY_SUGGESTIONS",
                "No microcopy suggestions were generated during retry"
            );

        }

        // ----------------------------------------------------
        // FR-18 — Validate Context Relevance
        // ----------------------------------------------------

        const validSuggestions =
            validateContext(
                microcopy.ui_context,
                suggestions
            );

        // ----------------------------------------------------
        // FR-19 — Validate Accessibility
        // ----------------------------------------------------

        const accessibleSuggestions =
            validateAccessibility(
                validSuggestions
            );

        if (
            !accessibleSuggestions ||
            accessibleSuggestions.length === 0
        ) {

            return sendError(
                res,
                500,
                "RETRY_VALIDATION_FAILED",
                "Retry generated no valid microcopy suggestions"
            );

        }

        // ----------------------------------------------------
        // Update database with first retry result
        // ----------------------------------------------------

        const generatedText =
            accessibleSuggestions[0];

        const updated =
            await Microcopy.replaceOptions(
                microcopyId,
                generatedText
            );

        if (updated === 0) {

            return sendError(
                res,
                404,
                "RETRY_UPDATE_FAILED",
                "Retry result could not be saved"
            );

        }

        // ----------------------------------------------------
        // Save retry operation to history
        // ----------------------------------------------------

        await History.save(
            microcopyId,
            "retry"
        );

        console.log(
            "========== FR-30 RETRY SUCCESS =========="
        );

        // ----------------------------------------------------
        // Return result
        // ----------------------------------------------------

        return res.status(200).json({

            message:
                "Microcopy retry completed successfully",

            microcopyId,

            retried: true,

            suggestions:
                accessibleSuggestions

        });

    } catch (err) {

        console.error(
            "FR-30 retry error:",
            err
        );

        // ----------------------------------------------------
        // AI service failure
        // ----------------------------------------------------

        if (err.code === "ECONNREFUSED") {

            return sendError(
                res,
                503,
                "AI_SERVICE_UNAVAILABLE",
                "AI service is unavailable. Please retry again."
            );

        }

        if (err.response) {

            console.error(
                "AI Status:",
                err.response.status
            );

            console.error(
                "AI Data:",
                err.response.data
            );

        }

        return sendError(
            res,
            500,
            "RETRY_FAILED",
            "Microcopy retry failed"
        );

    }

};