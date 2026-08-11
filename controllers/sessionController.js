const Session = require("../models/Session");


// ============================================================
// FR-01 — Launch Plugin / Create Session
// ============================================================

exports.createSession = async (req, res) => {

    try {

        const {
            figmaSessionId,
            designerId,
            figmaFileId,
            expiresAt
        } = req.body;


        // Validate required fields
        if (!figmaSessionId) {

            return res.status(400).json({
                message: "figmaSessionId is required"
            });

        }


        if (!designerId) {

            return res.status(400).json({
                message: "designerId is required"
            });

        }


        if (!figmaFileId) {

            return res.status(400).json({
                message: "figmaFileId is required"
            });

        }


        // Check whether an active session already exists
        const existingSessions =
            await Session.getActiveByFile(figmaFileId);


        if (existingSessions.length > 0) {

            return res.status(409).json({
                message:
                    "An active session already exists for this Figma file"
            });

        }


        // Create session
        const id = await Session.create(
            figmaSessionId,
            designerId,
            figmaFileId,
            expiresAt || null
        );


        res.status(201).json({

            message:
                "Plugin session created successfully",

            id,

            figmaSessionId,

            designerId,

            figmaFileId,

            status: "active"

        });


    } catch (err) {

        console.error(
            "Create session error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to create plugin session"

        });

    }

};



// ============================================================
// FR-02 / FR-03 — Get Session
// ============================================================

exports.getSession = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        if (!session) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        res.status(200).json({

            session

        });


    } catch (err) {

        console.error(
            "Get session error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to retrieve session"

        });

    }

};



// ============================================================
// FR-02 — Check Figma Login Status
// ============================================================

exports.checkLoginStatus = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        console.log(
            "========== FR-02 CHECK LOGIN STATUS =========="
        );

        console.log(
            "Figma Session ID:",
            figmaSessionId
        );


        // Validate session ID
        if (!figmaSessionId) {

            return res.status(400).json({

                loggedIn: false,

                message:
                    "figmaSessionId is required"

            });

        }


        // Get session directly from database
        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        console.log(
            "Session from database:",
            session
        );


        // Session does not exist
        if (!session) {

            return res.status(401).json({

                loggedIn: false,

                message:
                    "Figma plugin session not found"

            });

        }


        // Check session status
        if (session.status !== "active") {

            return res.status(401).json({

                loggedIn: false,

                message:
                    "Figma plugin session is not active",

                status:
                    session.status

            });

        }


        // Check expiration
        if (session.expires_at) {

            const currentTime = new Date();

            const expiryTime =
                new Date(session.expires_at);


            console.log(
                "Current time:",
                currentTime
            );

            console.log(
                "Expiry time:",
                expiryTime
            );


            if (expiryTime <= currentTime) {

                // Try to terminate expired session
                try {

                    await Session.terminate(
                        figmaSessionId
                    );

                } catch (terminateError) {

                    console.error(
                        "Failed to terminate expired session:",
                        terminateError
                    );

                }


                return res.status(401).json({

                    loggedIn: false,

                    message:
                        "Figma plugin session has expired"

                });

            }

        }


        // Login successful
        console.log(
            "FR-02 LOGIN STATUS: ACTIVE"
        );


        return res.status(200).json({

            loggedIn: true,

            message:
                "Figma plugin session is active",

            session: {

                figmaSessionId:
                    session.figma_session_id,

                designerId:
                    session.designer_id,

                figmaFileId:
                    session.figma_file_id,

                status:
                    session.status,

                expiresAt:
                    session.expires_at

            }

        });


    } catch (err) {

        console.error(
            "========== FR-02 ERROR =========="
        );

        console.error(err);


        res.status(500).json({

            loggedIn: false,

            message:
                "Failed to check Figma login status",

            error:
                err.message

        });

    }

};



// ============================================================
// FR-03 — Authenticate Plugin User
// ============================================================

exports.authenticatePluginUser = async (req, res) => {

    try {

        const {
            figmaSessionId,
            designerId,
            figmaFileId
        } = req.body;


        // Validate session ID
        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        // Validate designer ID
        if (!designerId) {

            return res.status(400).json({

                message:
                    "designerId is required"

            });

        }


        // Validate Figma file ID
        if (!figmaFileId) {

            return res.status(400).json({

                message:
                    "figmaFileId is required"

            });

        }


        // Authenticate user/session
        const session =
            await Session.authenticate(
                figmaSessionId,
                designerId,
                figmaFileId
            );


        if (!session) {

            return res.status(401).json({

                authenticated: false,

                message:
                    "Plugin user authentication failed"

            });

        }


        // Update session activity
        await Session.updateActivity(
            figmaSessionId
        );


        res.status(200).json({

            authenticated: true,

            message:
                "Plugin user authenticated successfully",

            user: {

                designerId:
                    session.designer_id,

                figmaSessionId:
                    session.figma_session_id,

                figmaFileId:
                    session.figma_file_id

            },

            sessionStatus:
                session.status

        });


    } catch (err) {

        console.error(
            "Authentication error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to authenticate plugin user"

        });

    }

};



// ============================================================
// FR-04 — Maintain Plugin Session
// ============================================================

exports.updateSession = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        const updated =
            await Session.updateActivity(
                figmaSessionId
            );


        if (updated === 0) {

            return res.status(404).json({

                message:
                    "Active session not found"

            });

        }


        res.status(200).json({

            message:
                "Session activity updated successfully",

            figmaSessionId

        });


    } catch (err) {

        console.error(
            "Update session error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to update session"

        });

    }

};



// ============================================================
// FR-05 — Terminate Plugin Session
// ============================================================

exports.terminateSession = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        const terminated =
            await Session.terminate(
                figmaSessionId
            );


        if (terminated === 0) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        res.status(200).json({

            message:
                "Plugin session terminated successfully",

            figmaSessionId

        });


    } catch (err) {

        console.error(
            "Terminate session error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to terminate session"

        });

    }

};



// ============================================================
// FR-09 — Link UI Element to Plugin Session
// ============================================================

exports.linkElementToSession = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        const {
            selectedElementId,
            selectedElementType,
            selectedElementName
        } = req.body;


        // Validate session ID
        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        // Validate element ID
        if (!selectedElementId) {

            return res.status(400).json({

                message:
                    "selectedElementId is required"

            });

        }


        // Validate element type
        if (!selectedElementType) {

            return res.status(400).json({

                message:
                    "selectedElementType is required"

            });

        }


        // Check session
        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        if (!session) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        // Only active sessions
        if (session.status !== "active") {

            return res.status(400).json({

                message:
                    "Session is not active"

            });

        }


        // Link element
        const updated =
            await Session.linkElement(
                figmaSessionId,
                selectedElementId,
                selectedElementType,
                selectedElementName || null
            );


        if (updated === 0) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        res.status(200).json({

            message:
                "UI element linked to session successfully",

            figmaSessionId,

            selectedElement: {

                id:
                    selectedElementId,

                type:
                    selectedElementType,

                name:
                    selectedElementName || null

            }

        });


    } catch (err) {

        console.error(
            "Link element error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to link UI element to session"

        });

    }

};



// ============================================================
// FR-06 — Detect UI Element Selection
// FR-07 — Validate Editable UI Element
// FR-08 — Validate Single Selection
// ============================================================

exports.validateSelection = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        const {
            selectedElementId,
            selectedElementType,
            selectedElementName,
            selectionCount
        } = req.body;


        // FR-06 — Check session ID
        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        // Check selection
        if (!selectedElementId) {

            return res.status(400).json({

                valid: false,

                message:
                    "No UI element selected"

            });

        }


        // FR-08 — Validate single selection
        const count =
            Number(selectionCount || 1);


        if (count !== 1) {

            return res.status(400).json({

                valid: false,

                message:
                    "Please select exactly one UI element"

            });

        }


        // Check session
        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        if (!session) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        if (session.status !== "active") {

            return res.status(400).json({

                message:
                    "Session is not active"

            });

        }


        // FR-07 — Validate editable element
        if (!selectedElementType) {

            return res.status(400).json({

                valid: false,

                message:
                    "selectedElementType is required"

            });

        }


        // TEXT elements are editable microcopy elements
        if (selectedElementType !== "TEXT") {

            return res.status(400).json({

                valid: false,

                message:
                    "Selected UI element is not editable microcopy text"

            });

        }


        res.status(200).json({

            valid: true,

            message:
                "UI element selection is valid",

            figmaSessionId,

            selectedElement: {

                id:
                    selectedElementId,

                type:
                    selectedElementType,

                name:
                    selectedElementName || null

            }

        });


    } catch (err) {

        console.error(
            "Selection validation error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to validate UI element selection"

        });

    }

};



// ============================================================
// FR-10 — Enable Microcopy Request
// ============================================================

exports.enableMicrocopyRequest = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        if (!session) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        if (session.status !== "active") {

            return res.status(400).json({

                message:
                    "Session is not active"

            });

        }


        if (!session.selected_element_id) {

            return res.status(400).json({

                message:
                    "No UI element is selected"

            });

        }


        if (session.selected_element_type !== "TEXT") {

            return res.status(400).json({

                message:
                    "Selected UI element is not editable microcopy text"

            });

        }


        res.status(200).json({

            enabled: true,

            message:
                "Microcopy request is enabled",

            figmaSessionId,

            selectedElement: {

                id:
                    session.selected_element_id,

                type:
                    session.selected_element_type,

                name:
                    session.selected_element_name

            }

        });


    } catch (err) {

        console.error(
            "Enable microcopy error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to enable microcopy request"

        });

    }

};



// ============================================================
// FR-11 — Display Configuration Dialog
// ============================================================

exports.getConfiguration = async (req, res) => {

    try {

        const {
            figmaSessionId
        } = req.params;


        if (!figmaSessionId) {

            return res.status(400).json({

                message:
                    "figmaSessionId is required"

            });

        }


        const session =
            await Session.getBySessionId(
                figmaSessionId
            );


        if (!session) {

            return res.status(404).json({

                message:
                    "Session not found"

            });

        }


        if (session.status !== "active") {

            return res.status(400).json({

                message:
                    "Session is not active"

            });

        }


        if (!session.selected_element_id) {

            return res.status(400).json({

                message:
                    "No UI element is selected"

            });

        }


        res.status(200).json({

            figmaSessionId,

            selectedElement: {

                id:
                    session.selected_element_id,

                type:
                    session.selected_element_type,

                name:
                    session.selected_element_name

            },

            configuration: {

                intent: "",

                tone: "Friendly",

                persona: "General User",

                language: "English"

            }

        });


    } catch (err) {

        console.error(
            "Get configuration error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to load configuration"

        });

    }

};