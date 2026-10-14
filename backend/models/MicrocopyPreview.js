const db = require("../database/db");

class MicrocopyPreview {

    // ============================================
    // Create Preview
    // FR-24
    // ============================================

    static create(microcopyId, previewText) {

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO microcopy_previews
                (
                    microcopy_id,
                    preview_text,
                    status
                )
                VALUES (?, ?, 'pending')
            `;

            db.run(
                sql,
                [
                    microcopyId,
                    previewText
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


    // ============================================
    // Get Preview
    // FR-24
    // ============================================

    static getByMicrocopyId(microcopyId) {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM microcopy_previews
                WHERE microcopy_id = ?
                ORDER BY id DESC
                LIMIT 1
            `;

            db.get(
                sql,
                [microcopyId],
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


    // ============================================
    // Confirm Preview
    // FR-25
    // ============================================

    static confirm(id) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE microcopy_previews
                SET
                    status = 'confirmed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.run(
                sql,
                [id],
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


    // ============================================
    // Discard Preview
    // FR-26
    // ============================================

    static discard(id) {

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE microcopy_previews
                SET
                    status = 'discarded',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.run(
                sql,
                [id],
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

module.exports = MicrocopyPreview;