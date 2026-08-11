const History = require("../models/History");
const Microcopy = require("../models/Microcopy");


// ============================================================
// FR-32 — Save Plugin Operation
// ============================================================

exports.saveHistory = async (req, res) => {

    try {

        const {
            microcopy_id,
            action
        } = req.body;


        // ----------------------------------------------------
        // Validate microcopy ID
        // ----------------------------------------------------

        const microcopyId =
            Number(microcopy_id);


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
        // Validate action
        // ----------------------------------------------------

        if (
            !action ||
            typeof action !== "string"
        ) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_ACTION",
                    message: "Valid action is required"
                }

            });

        }


        // ----------------------------------------------------
        // Check whether microcopy exists
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


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
        // Save history record
        // History model validates allowed actions
        // ----------------------------------------------------

        const id =
            await History.save(
                microcopyId,
                action
            );


        // ----------------------------------------------------
        // Success response
        // ----------------------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "History saved successfully",

            id,

            microcopy_id:
                microcopyId,

            action

        });


    } catch (err) {

        console.error(
            "Save history error:",
            err
        );


        // Invalid action from History model
        if (
            err.message ===
            "Invalid history action"
        ) {

            return res.status(400).json({

                success: false,

                error: {
                    code: "INVALID_ACTION",
                    message:
                        "Invalid history action"
                }

            });

        }


        return res.status(500).json({

            success: false,

            error: {
                code: "HISTORY_SAVE_FAILED",
                message:
                    "Failed to save history"
            }

        });

    }

};



// ============================================================
// FR-32 — Get History for One Microcopy
// ============================================================

exports.getHistory = async (req, res) => {

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
                    message:
                        "Valid microcopy_id is required"
                }

            });

        }


        // ----------------------------------------------------
        // Check whether microcopy exists
        // ----------------------------------------------------

        const microcopy =
            await Microcopy.getById(
                microcopyId
            );


        if (!microcopy) {

            return res.status(404).json({

                success: false,

                error: {
                    code: "MICROCOPY_NOT_FOUND",
                    message:
                        "Microcopy not found"
                }

            });

        }


        // ----------------------------------------------------
        // Get history
        // ----------------------------------------------------

        const history =
            await History.getByMicrocopyId(
                microcopyId
            );


        // ----------------------------------------------------
        // Success response
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            microcopy_id:
                microcopyId,

            history

        });


    } catch (err) {

        console.error(
            "Get history error:",
            err
        );


        return res.status(500).json({

            success: false,

            error: {
                code: "HISTORY_RETRIEVAL_FAILED",
                message:
                    "Failed to retrieve history"
            }

        });

    }

};



// ============================================================
// FR-32 — Get All Plugin Operation History
// ============================================================

exports.getAllHistory = async (req, res) => {

    try {

        // ----------------------------------------------------
        // Get all history records
        // ----------------------------------------------------

        const history =
            await History.getAll();


        // ----------------------------------------------------
        // Success response
        // ----------------------------------------------------

        return res.status(200).json({

            success: true,

            count:
                history.length,

            history

        });


    } catch (err) {

        console.error(
            "Get all history error:",
            err
        );


        return res.status(500).json({

            success: false,

            error: {
                code: "HISTORY_RETRIEVAL_FAILED",
                message:
                    "Failed to retrieve history"
            }

        });

    }

};