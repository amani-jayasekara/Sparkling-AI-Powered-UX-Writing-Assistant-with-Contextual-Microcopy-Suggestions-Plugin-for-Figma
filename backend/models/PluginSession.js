const db = require("../database/db");

class PluginSession {

    // FR-01 — Create Session
    static create(figmaSessionId, designerId, figmaFileId, expiresAt) {

        return new Promise((resolve, reject) => {

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
                    figmaSessionId,
                    designerId,
                    figmaFileId,
                    expiresAt || null
                ],
                function (err) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }

                }
            );

        });

    }


    // FR-02 / FR-03 — Get Session
    static getBySessionId(figmaSessionId) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM plugin_sessions
                WHERE figma_session_id = ?
            `;

            db.get(
                sql,
                [figmaSessionId],
                (err, row) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }

                }
            );

        });

    }


    // FR-02 — Check active/non-expired session
    static checkLoginStatus(figmaSessionId) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM plugin_sessions
                WHERE figma_session_id = ?
                AND status = 'active'
                AND (
                    expires_at IS NULL
                    OR datetime(expires_at) > datetime('now')
                )
            `;

            db.get(
                sql,
                [figmaSessionId],
                (err, row) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }

                }
            );

        });

    }


    // FR-03 — Authenticate session/user
    static authenticate(
        figmaSessionId,
        designerId,
        figmaFileId
    ) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM plugin_sessions
                WHERE figma_session_id = ?
                AND designer_id = ?
                AND figma_file_id = ?
                AND status = 'active'
                AND (
                    expires_at IS NULL
                    OR datetime(expires_at) > datetime('now')
                )
            `;

            db.get(
                sql,
                [
                    figmaSessionId,
                    designerId,
                    figmaFileId
                ],
                (err, row) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }

                }
            );

        });

    }


    // FR-04 — Maintain Session
    static updateActivity(figmaSessionId) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE plugin_sessions
                SET last_activity = CURRENT_TIMESTAMP
                WHERE figma_session_id = ?
                AND status = 'active'
            `;

            db.run(
                sql,
                [figmaSessionId],
                function (err) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }

                }
            );

        });

    }


    // FR-05 — Terminate Session
    static terminate(figmaSessionId) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE plugin_sessions
                SET
                    status = 'terminated',
                    last_activity = CURRENT_TIMESTAMP
                WHERE figma_session_id = ?
            `;

            db.run(
                sql,
                [figmaSessionId],
                function (err) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }

                }
            );

        });

    }


    // FR-09 — Link selected UI element
    static linkElement(
        figmaSessionId,
        selectedElementId,
        selectedElementType,
        selectedElementName
    ) {

        return new Promise((resolve, reject) => {

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
                    selectedElementId,
                    selectedElementType,
                    selectedElementName || null,
                    figmaSessionId
                ],
                function (err) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }

                }
            );

        });

    }


    // Get active sessions for a Figma file
    static getActiveByFile(figmaFileId) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM plugin_sessions
                WHERE figma_file_id = ?
                AND status = 'active'
            `;

            db.all(
                sql,
                [figmaFileId],
                (err, rows) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }

                }
            );

        });

    }

}

module.exports = PluginSession;