const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "database.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(
            "Database connection failed:",
            err.message
        );
        return;
    }

    console.log(
        "Connected to SQLite database."
    );

    // ---------------------------------------------------------
    // Enable foreign keys
    // ---------------------------------------------------------

    db.run(
        "PRAGMA foreign_keys = ON",
        (err) => {

            if (err) {
                console.error(
                    "Failed to enable foreign keys:",
                    err.message
                );
            } else {
                console.log(
                    "SQLite foreign keys enabled."
                );
            }

            // -------------------------------------------------
            // Run migrations FIRST
            // -------------------------------------------------

            runMigrations(() => {

                // ---------------------------------------------
                // Load schema AFTER migrations
                // ---------------------------------------------

                loadSchema();

            });

        }
    );
});


// ============================================================
// DATABASE MIGRATIONS
// ============================================================

function runMigrations(callback) {

    const migrations = [

        `
        ALTER TABLE microcopy
        ADD COLUMN designer_id TEXT
        `,

        `
        ALTER TABLE microcopy
        ADD COLUMN element_id TEXT
        `,

        `
        ALTER TABLE microcopy
        ADD COLUMN element_name TEXT
        `,

        `
        ALTER TABLE microcopy
        ADD COLUMN original_text TEXT
        `,

        `
        ALTER TABLE microcopy
        ADD COLUMN suggestions_json TEXT
        `,

        `
        CREATE TABLE IF NOT EXISTS microcopy_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            microcopy_id INTEGER,
            designer_id TEXT,
            element_id TEXT NOT NULL,
            previous_text TEXT,
            new_text TEXT NOT NULL,
            action TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (microcopy_id)
                REFERENCES microcopy(id)
        )
        `
    ];


    let completed = 0;


    function nextMigration() {

        if (completed >= migrations.length) {

            console.log(
                "Database migrations completed."
            );

            callback();

            return;
        }


        const sql =
            migrations[completed];


        db.run(
            sql,
            (err) => {

                if (err) {

                    // SQLite gives this error when the
                    // column already exists.
                    //
                    // That is safe to ignore because the
                    // migration has already been applied.

                    if (
                        err.message.includes(
                            "duplicate column name"
                        )
                    ) {

                        console.log(
                            "Migration already applied:",
                            sql
                                .replace(/\s+/g, " ")
                                .trim()
                                .substring(0, 80) + "..."
                        );

                    } else {

                        console.error(
                            "Migration error:",
                            err.message
                        );

                    }

                } else {

                    console.log(
                        "Migration applied successfully."
                    );

                }


                completed++;

                nextMigration();

            }
        );

    }


    nextMigration();

}


// ============================================================
// LOAD DATABASE SCHEMA
// ============================================================

function loadSchema() {

    try {

        const schema =
            fs.readFileSync(
                schemaPath,
                "utf8"
            );


        db.exec(
            schema,
            (err) => {

                if (err) {

                    console.error(
                        "Schema creation failed:",
                        err.message
                    );

                    return;
                }


                console.log(
                    "Database schema loaded successfully."
                );

            }
        );

    } catch (error) {

        console.error(
            "Unable to read schema.sql:",
            error.message
        );

    }

}


// ============================================================
// EXPORT DATABASE
// ============================================================

module.exports = db;