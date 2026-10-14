const db = require("../database/db");

class Feedback {

    // ========================================================
    // FR-31 — Save User Feedback
    // ========================================================

    static save(microcopyId, rating, comment) {

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
            // Validate rating
            // Rating must be between 1 and 5
            // ------------------------------------------------

            if (
                !Number.isInteger(Number(rating)) ||
                Number(rating) < 1 ||
                Number(rating) > 5
            ) {

                return reject(
                    new Error(
                        "Rating must be an integer between 1 and 5"
                    )
                );

            }


            // ------------------------------------------------
            // Validate comment
            // ------------------------------------------------

            if (
                comment !== null &&
                comment !== undefined &&
                typeof comment !== "string"
            ) {

                return reject(
                    new Error(
                        "Comment must be a string"
                    )
                );

            }


            // ------------------------------------------------
            // Insert feedback
            // ------------------------------------------------

            const sql = `
                INSERT INTO feedback
                (
                    microcopy_id,
                    rating,
                    comment
                )
                VALUES (?, ?, ?)
            `;


            db.run(
                sql,
                [
                    Number(microcopyId),
                    Number(rating),
                    comment || null
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Feedback database error:",
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


    // ========================================================
    // Get Feedback for One Microcopy
    // ========================================================

    static getByMicrocopyId(microcopyId) {

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
            // Get feedback
            // ------------------------------------------------

            const sql = `
                SELECT
                    id,
                    microcopy_id,
                    rating,
                    comment,
                    created_at
                FROM feedback
                WHERE microcopy_id = ?
                ORDER BY created_at DESC
            `;


            db.all(
                sql,
                [Number(microcopyId)],
                (err, rows) => {

                    if (err) {

                        console.error(
                            "Feedback retrieval database error:",
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

module.exports = Feedback;