const db = require("../database/db");

class Microcopy {

    // Create generated microcopy
    static create(
        uiContext,
        intent,
        tone,
        persona,
        generatedText,
        wcagScore = null
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
                    wcag_score
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(
                sql,
                [
                    uiContext,
                    intent,
                    tone,
                    persona,
                    generatedText,
                    wcagScore
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


    // Get microcopy by ID
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


    // Select a generated microcopy option
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

    // FR-23 — Replace Microcopy Options
static replaceOptions(id, generatedText) {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE microcopy
            SET generated_text = ?
            WHERE id = ?
        `;

        db.run(
            sql,
            [generatedText, id],
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

}

module.exports = Microcopy;