-- ============================================================
-- Sparkling UX Backend SQLite Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tone TEXT NOT NULL,
    persona TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS microcopy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ui_context TEXT NOT NULL,
    intent TEXT NOT NULL,
    tone TEXT NOT NULL,
    persona TEXT NOT NULL,
    generated_text TEXT NOT NULL,
    wcag_score INTEGER,
    designer_id TEXT,
    element_id TEXT,
    element_name TEXT,
    original_text TEXT,
    suggestions_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    microcopy_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (microcopy_id) REFERENCES microcopy(id)
);

CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    microcopy_id INTEGER,
    action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (microcopy_id) REFERENCES microcopy(id)
);

CREATE TABLE IF NOT EXISTS plugin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    figma_session_id TEXT NOT NULL UNIQUE,
    designer_id TEXT NOT NULL,
    figma_file_id TEXT NOT NULL,
    selected_element_id TEXT,
    selected_element_type TEXT,
    selected_element_name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS microcopy_previews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    microcopy_id INTEGER NOT NULL,
    preview_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (microcopy_id) REFERENCES microcopy(id)
);

-- Persistent text-change history for undo/redo/reapply.
CREATE TABLE IF NOT EXISTS microcopy_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    microcopy_id INTEGER,
    designer_id TEXT,
    element_id TEXT NOT NULL,
    previous_text TEXT,
    new_text TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (microcopy_id) REFERENCES microcopy(id)
);

CREATE INDEX IF NOT EXISTS idx_microcopy_designer
    ON microcopy(designer_id);

CREATE INDEX IF NOT EXISTS idx_microcopy_element
    ON microcopy(element_id);

CREATE INDEX IF NOT EXISTS idx_versions_designer
    ON microcopy_versions(designer_id);

CREATE INDEX IF NOT EXISTS idx_versions_element
    ON microcopy_versions(designer_id, element_id);
