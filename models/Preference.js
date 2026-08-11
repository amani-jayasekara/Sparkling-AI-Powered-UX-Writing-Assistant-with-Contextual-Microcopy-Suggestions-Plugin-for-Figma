const db = require("../database/db");

class Preference {

    static save(tone, persona, language) {

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO user_preferences
                (tone, persona, language)
                VALUES (?, ?, ?)
            `;

            db.run(sql, [tone, persona, language], function (err) {

                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }

            });

        });

    }

    static getLatest() {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT *
                FROM user_preferences
                ORDER BY id DESC
                LIMIT 1
            `;

            db.get(sql, [], (err, row) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }

            });

        });

    }

}

module.exports = Preference;