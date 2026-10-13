const db = require("../database/db");

class Microcopy {

    // =====================================================
    // CREATE GENERATED MICROCOPY
    // =====================================================
    static create(
    uiContext,
    intent,
    tone,
    persona,
    generatedText,
    wcagScore = null,
    metadata = {}
) {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO microcopy
            (
                ui_context,
                intent,
                tone,
                persona,
                generated_text,
                wcag_score,
                designer_id,
                element_id,
                element_name,
                original_text,
                suggestions_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                uiContext,
                intent,
                tone,
                persona,
                generatedText,
                wcagScore,

                metadata.designerId || null,
                metadata.elementId || null,
                metadata.elementName || null,
                metadata.originalText || null,

                JSON.stringify(
                    metadata.suggestions || []
                )
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


    // =====================================================
    // GET MICROCOPY BY ID
    // =====================================================
    static getById(id) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM microcopy
                WHERE id = ?
            `;

            db.get(
                sql,
                [id],
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


    // =====================================================
    // GET ALL SAVED MICROCOPY
    // =====================================================
    static getAll() {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM microcopy
                ORDER BY id DESC
            `;

            db.all(
                sql,
                [],
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


    // =====================================================
    // SELECT A GENERATED MICROCOPY OPTION
    // =====================================================
    static selectOption(id, selectedText) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE microcopy
                SET generated_text = ?
                WHERE id = ?
            `;

            db.run(
                sql,
                [selectedText, id],
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


    // =====================================================
    // REPLACE MICROCOPY OPTIONS
    // =====================================================
    static replaceOptions(id, generatedText, suggestions = null) {

        return new Promise((resolve, reject) => {

            const hasSuggestions =
                Array.isArray(suggestions);

            const sql = hasSuggestions
                ? `
                    UPDATE microcopy
                    SET generated_text = ?,
                        suggestions_json = ?
                    WHERE id = ?
                `
                : `
                    UPDATE microcopy
                    SET generated_text = ?
                    WHERE id = ?
                `;

            const params = hasSuggestions
                ? [generatedText, JSON.stringify(suggestions), id]
                : [generatedText, id];

            db.run(
                sql,
                params,
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


    // =====================================================
    // UPDATE ACCESSIBILITY / WCAG SCORE
    // =====================================================
    static updateWcagScore(id, wcagScore) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE microcopy
                SET wcag_score = ?
                WHERE id = ?
            `;

            db.run(
                sql,
                [wcagScore, id],
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

static getByDesignerId(designerId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                id,
                ui_context,
                intent,
                tone,
                persona,
                generated_text,
                wcag_score,
                designer_id,
                element_id,
                element_name,
                original_text,
                suggestions_json,
                created_at
            FROM microcopy
            WHERE designer_id = ?
            ORDER BY created_at DESC
        `;

        db.all(
            sql,
            [designerId],
            (err, rows) => {

                if (err) {
                    reject(err);
                } else {

                    const result =
                        rows.map(row => {

                            let suggestions = [];

                            try {
                                suggestions =
                                    JSON.parse(
                                        row.suggestions_json || "[]"
                                    );
                            } catch {
                                suggestions = [];
                            }

                            return {
                                ...row,
                                suggestions
                            };

                        });

                    resolve(result);
                }

            }
        );

    });

}


}


// =====================================================
// EXPORT MODEL
// =====================================================
module.exports = Microcopy;