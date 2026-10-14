const db = require("../database/db");

class Session {

    // ============================================================
    // FR-01 — Create Plugin Session
    // ============================================================

    static create(
        figmaSessionId,
        designerId,
        figmaFileId,
        expiresAt
    ) {

        return new Promise((resolve, reject) => {

            // ----------------------------------------------------
            // Validate session data
            // ----------------------------------------------------

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {
                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );
            }

            if (
                !designerId ||
                typeof designerId !== "string"
            ) {
                return reject(
                    new Error(
                        "Valid designer ID is required"
                    )
                );
            }

            if (
                !figmaFileId ||
                typeof figmaFileId !== "string"
            ) {
                return reject(
                    new Error(
                        "Valid Figma file ID is required"
                    )
                );
            }


            // ----------------------------------------------------
            // Create session
            // ----------------------------------------------------

            const sql = `
                INSERT INTO plugin_sessions
                (
                    figma_session_id,
                    designer_id,
                    figma_file_id,
                    status,
                    expires_at
                )
                VALUES (?, ?, ?, 'active', ?)
            `;

            db.run(
                sql,
                [
                    figmaSessionId.trim(),
                    designerId.trim(),
                    figmaFileId.trim(),
                    expiresAt || null
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Session creation database error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(this.lastID);

                    }

                }
            );

        });

    }


    // ============================================================
    // FR-02 / FR-03 — Get Session
    // ============================================================

    static getBySessionId(figmaSessionId) {

        return new Promise((resolve, reject) => {

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );

            }


            const sql = `
                SELECT
                    id,
                    figma_session_id,
                    designer_id,
                    figma_file_id,
                    selected_element_id,
                    selected_element_type,
                    selected_element_name,
                    status,
                    created_at,
                    last_activity,
                    expires_at
                FROM plugin_sessions
                WHERE figma_session_id = ?
            `;


            db.get(
                sql,
                [figmaSessionId.trim()],
                (err, row) => {

                    if (err) {

                        console.error(
                            "Session retrieval error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(row);

                    }

                }
            );

        });

    }


    // ============================================================
    // FR-03 — Authenticate Plugin User
    // ============================================================

    static authenticate(
        figmaSessionId,
        designerId,
        figmaFileId
    ) {

        return new Promise((resolve, reject) => {

            // ----------------------------------------------------
            // Validate authentication data
            // ----------------------------------------------------

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );

            }

            if (
                !designerId ||
                typeof designerId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid designer ID is required"
                    )
                );

            }

            if (
                !figmaFileId ||
                typeof figmaFileId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma file ID is required"
                    )
                );

            }


            // ----------------------------------------------------
            // Find active session
            // ----------------------------------------------------

            const sql = `
                SELECT
                    id,
                    figma_session_id,
                    designer_id,
                    figma_file_id,
                    selected_element_id,
                    selected_element_type,
                    selected_element_name,
                    status,
                    created_at,
                    last_activity,
                    expires_at
                FROM plugin_sessions
                WHERE figma_session_id = ?
                AND designer_id = ?
                AND figma_file_id = ?
                AND status = 'active'
            `;


            db.get(
                sql,
                [
                    figmaSessionId.trim(),
                    designerId.trim(),
                    figmaFileId.trim()
                ],
                (err, row) => {

                    if (err) {

                        console.error(
                            "Authentication database error:",
                            err
                        );

                        return reject(err);

                    }


                    // ------------------------------------------------
                    // Session not found
                    // ------------------------------------------------

                    if (!row) {

                        return resolve(null);

                    }


                    // ------------------------------------------------
                    // Update activity after authentication
                    // ------------------------------------------------

                    const updateSql = `
                        UPDATE plugin_sessions
                        SET last_activity = CURRENT_TIMESTAMP
                        WHERE figma_session_id = ?
                        AND status = 'active'
                    `;


                    db.run(
                        updateSql,
                        [figmaSessionId.trim()],
                        (updateErr) => {

                            if (updateErr) {

                                console.error(
                                    "Authentication activity update error:",
                                    updateErr
                                );

                                return reject(updateErr);

                            }


                            // Update returned session activity
                            row.last_activity =
                                new Date().toISOString();


                            resolve(row);

                        }
                    );

                }
            );

        });

    }


    // ============================================================
    // FR-04 — Maintain Plugin Session
    // ============================================================

    static updateActivity(figmaSessionId) {

        return new Promise((resolve, reject) => {

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );

            }


            const sql = `
                UPDATE plugin_sessions
                SET
                    last_activity = CURRENT_TIMESTAMP
                WHERE figma_session_id = ?
                AND status = 'active'
            `;


            db.run(
                sql,
                [figmaSessionId.trim()],
                function (err) {

                    if (err) {

                        console.error(
                            "Session activity update error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(this.changes);

                    }

                }
            );

        });

    }


    // ============================================================
    // FR-05 — Terminate Plugin Session
    // ============================================================

    static terminate(figmaSessionId) {

        return new Promise((resolve, reject) => {

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );

            }


            const sql = `
                UPDATE plugin_sessions
                SET
                    status = 'terminated',
                    last_activity = CURRENT_TIMESTAMP
                WHERE figma_session_id = ?
                AND status = 'active'
            `;


            db.run(
                sql,
                [figmaSessionId.trim()],
                function (err) {

                    if (err) {

                        console.error(
                            "Session termination error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(this.changes);

                    }

                }
            );

        });

    }


    // ============================================================
    // Check Active Sessions
    // ============================================================

    static getActiveByFile(figmaFileId) {

        return new Promise((resolve, reject) => {

            if (
                !figmaFileId ||
                typeof figmaFileId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma file ID is required"
                    )
                );

            }


            const sql = `
                SELECT
                    id,
                    figma_session_id,
                    designer_id,
                    figma_file_id,
                    selected_element_id,
                    selected_element_type,
                    selected_element_name,
                    status,
                    created_at,
                    last_activity,
                    expires_at
                FROM plugin_sessions
                WHERE figma_file_id = ?
                AND status = 'active'
            `;


            db.all(
                sql,
                [figmaFileId.trim()],
                (err, rows) => {

                    if (err) {

                        console.error(
                            "Active session lookup error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(rows);

                    }

                }
            );

        });

    }


    // ============================================================
    // FR-09 — Link UI Element to Session
    // ============================================================

    static linkElement(
        figmaSessionId,
        selectedElementId,
        selectedElementType,
        selectedElementName
    ) {

        return new Promise((resolve, reject) => {

            // ----------------------------------------------------
            // Validate session ID
            // ----------------------------------------------------

            if (
                !figmaSessionId ||
                typeof figmaSessionId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid Figma session ID is required"
                    )
                );

            }


            // ----------------------------------------------------
            // Validate element ID
            // ----------------------------------------------------

            if (
                !selectedElementId ||
                typeof selectedElementId !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid selected element ID is required"
                    )
                );

            }


            // ----------------------------------------------------
            // Validate element type
            // ----------------------------------------------------

            if (
                !selectedElementType ||
                typeof selectedElementType !== "string"
            ) {

                return reject(
                    new Error(
                        "Valid selected element type is required"
                    )
                );

            }


            // ----------------------------------------------------
            // Link element
            // ----------------------------------------------------

            const sql = `
                UPDATE plugin_sessions
                SET
                    selected_element_id = ?,
                    selected_element_type = ?,
                    selected_element_name = ?,
                    last_activity = CURRENT_TIMESTAMP
                WHERE figma_session_id = ?
                AND status = 'active'
            `;


            db.run(
                sql,
                [
                    selectedElementId.trim(),
                    selectedElementType.trim(),
                    selectedElementName
                        ? selectedElementName.trim()
                        : null,
                    figmaSessionId.trim()
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Element linking error:",
                            err
                        );

                        reject(err);

                    } else {

                        resolve(this.changes);

                    }

                }
            );

        });

    }

}


module.exports = Session;