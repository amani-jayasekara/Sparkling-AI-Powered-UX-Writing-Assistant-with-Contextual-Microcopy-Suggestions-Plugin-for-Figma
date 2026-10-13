const db = require("../database/db");

class MicrocopyVersion {
    static create({
        microcopyId = null,
        designerId = null,
        elementId,
        previousText = "",
        newText,
        action = "apply"
    }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO microcopy_versions
                (
                    microcopy_id,
                    designer_id,
                    element_id,
                    previous_text,
                    new_text,
                    action
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(
                sql,
                [
                    microcopyId,
                    designerId,
                    elementId,
                    previousText,
                    newText,
                    action
                ],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    static getByDesignerId(designerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    v.id,
                    v.microcopy_id,
                    v.designer_id,
                    v.element_id,
                    v.previous_text,
                    v.new_text,
                    v.action,
                    v.created_at,
                    m.element_name,
                    m.ui_context,
                    m.intent,
                    m.tone,
                    m.persona,
                    m.original_text,
                    m.suggestions_json,
                    m.wcag_score
                FROM microcopy_versions v
                LEFT JOIN microcopy m
                    ON m.id = v.microcopy_id
                WHERE v.designer_id = ?
                ORDER BY v.created_at DESC, v.id DESC
            `;

            db.all(sql, [designerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getByElementId(designerId, elementId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT *
                FROM microcopy_versions
                WHERE designer_id = ?
                  AND element_id = ?
                ORDER BY created_at DESC, id DESC
            `;

            db.all(sql, [designerId, elementId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = MicrocopyVersion;
