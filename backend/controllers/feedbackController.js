const Feedback = require("../models/Feedback");
const Microcopy = require("../models/Microcopy");


// ============================================================
// FR-31 — Save Feedback
// ============================================================

exports.saveFeedback = async (req, res) => {

    try {

        const {
            microcopy_id,
            rating,
            comment
        } = req.body;


        // ----------------------------------------------------
        // Validate microcopy_id
        // ----------------------------------------------------

        const microcopyId = Number(microcopy_id);

        if (
            !microcopy_id ||
            !Number.isInteger(microcopyId) ||
            microcopyId <= 0
        ) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_MICROCOPY_ID",
                    message: "Valid microcopy_id is required"
                }

            });

        }


        // ----------------------------------------------------
        // Validate rating
        // Rating must be integer between 1 and 5
        // ----------------------------------------------------

        const numericRating = Number(rating);

        if (
            rating === undefined ||
            rating === null ||
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_RATING",
                    message: "Rating must be an integer between 1 and 5"
                }

            });

        }


        // ----------------------------------------------------
        // Validate comment
        // ----------------------------------------------------

        let cleanComment = null;

        if (comment !== undefined && comment !== null) {

            if (typeof comment !== "string") {

                return res.status(400).json({

                    success: false,

                    error: {
                        code: "INVALID_COMMENT",
                        message: "Comment must be a string"
                    }

                });

            }

            cleanComment = comment.trim();

        }


        // ----------------------------------------------------
        // Check whether microcopy exists
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(microcopyId);


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {
                    code: "MICROCOPY_NOT_FOUND",
                    message: "Microcopy not found"
                }

            });

        }


        // ----------------------------------------------------
        // Save feedback
        // ----------------------------------------------------

        const id = await Feedback.save(

            microcopyId,

            numericRating,

            cleanComment || null

        );


        // ----------------------------------------------------
        // Success response
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message: "Feedback saved successfully",

            feedbackId: id,

            microcopyId: microcopyId,

            rating: numericRating,

            comment: cleanComment || null

        });


    } catch (err) {

        console.error(
            "Save feedback error:",
            err
        );


        return res.status(500).json({

            success: false,

            error: {
                code: "FEEDBACK_SAVE_FAILED",
                message: "Failed to save feedback"
            }

        });

    }

};



// ============================================================
// Get Feedback for Microcopy
// ============================================================

exports.getFeedback = async (req, res) => {

    try {

        const microcopyId =
            Number(req.params.microcopy_id);


        // ----------------------------------------------------
        // Validate microcopy ID
        // ----------------------------------------------------

        if (
            !Number.isInteger(microcopyId) ||
            microcopyId <= 0
        ) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_MICROCOPY_ID",
                    message: "Valid microcopy_id is required"
                }

            });

        }


        // ----------------------------------------------------
        // Check whether microcopy exists
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(microcopyId);


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {
                    code: "MICROCOPY_NOT_FOUND",
                    message: "Microcopy not found"
                }

            });

        }


        // ----------------------------------------------------
        // Get feedback
        // ----------------------------------------------------

        const feedback =
            await Feedback.getByMicrocopyId(
                microcopyId
            );


        // ----------------------------------------------------
        // Success response
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            microcopy_id: microcopyId,

            feedback

        });


    } catch (err) {

        console.error(
            "Get feedback error:",
            err
        );


        return res.status(500).json({

            success: false,

            error: {
                code: "FEEDBACK_RETRIEVAL_FAILED",
                message: "Failed to retrieve feedback"
            }

        });

    }

};