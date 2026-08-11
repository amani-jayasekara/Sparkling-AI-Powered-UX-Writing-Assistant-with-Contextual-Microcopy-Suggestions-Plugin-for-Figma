const db = require("../database/db");

class History {

    // ========================================================
    // FR-32 — Log Plugin Operation
    // ========================================================

    static save(microcopyId, action) {

        return new Promise((resolve, reject) => {

            // ------------------------------------------------
            // Validate microcopy ID
            // ------------------------------------------------

            if (
                !Number.isInteger(Number(microcopyId)) ||
                Number(microcopyId) <= 0
            ) {

                return reject(
                    new Error("Invalid microcopy ID")
                );

            }


            // ------------------------------------------------
            // Allowed operations
            // ------------------------------------------------

            const allowedActions = [
                "generate",
                "select",
                "regenerate",
                "replace",
                "preview",
                "confirm",
                "discard",
                "export",
                "edit",
                "retry"
            ];


            // ------------------------------------------------
            // Validate action
            // ------------------------------------------------

            if (
                typeof action !== "string" ||
                !allowedActions.includes(action)
            ) {

                return reject(
                    new Error(
                        "Invalid history action"
                    )
                );

            }


            // ------------------------------------------------
            // Insert operation
            // ------------------------------------------------

            const sql = `
                INSERT INTO history
                (
                    microcopy_id,
                    action
                )
                VALUES (?, ?)
            `;


            db.run(
                sql,
                [
                    Number(microcopyId),
                    action
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "History database error:",
                            err
                        );

                        reject(err);

                    } else {

                        console.log(
                            `FR-32: Operation logged - ${action}`
                        );

                        resolve(this.lastID);

                    }

                }
            );

        });

    }


    // ========================================================
    // Get History for One Microcopy
    // ========================================================

    static getByMicrocopyId(microcopyId) {

        return new Promise((resolve, reject) => {

            // ------------------------------------------------
            // Validate ID
            // ------------------------------------------------

            if (
                !Number.isInteger(Number(microcopyId)) ||
                Number(microcopyId) <= 0
            ) {

                return reject(
                    new Error("Invalid microcopy ID")
                );

            }


            const sql = `
                SELECT
                    id,
                    microcopy_id,
                    action,
                    created_at
                FROM history
                WHERE microcopy_id = ?
                ORDER BY created_at DESC
            `;


            db.all(
                sql,
                [Number(microcopyId)],
                (err, rows) => {

                    if (err) {

                        console.error(
                            "History retrieval error:",
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


    // ========================================================
    // Get All History
    // ========================================================

    static getAll() {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    id,
                    microcopy_id,
                    action,
                    created_at
                FROM history
                ORDER BY created_at DESC
            `;


            db.all(
                sql,
                [],
                (err, rows) => {

                    if (err) {

                        console.error(
                            "All history retrieval error:",
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

}

module.exports = History;