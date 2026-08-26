ALTER TABLE site_versions
ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;

CREATE TABLE site_operations (
    id INTEGER PRIMARY KEY NOT NULL,
    site_version_id INTEGER NOT NULL,
    revision INTEGER NOT NULL,
    batch_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    protocol_version INTEGER NOT NULL,
    base_revision INTEGER NOT NULL,
    commands TEXT NOT NULL,
    author_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_version_id) REFERENCES site_versions(id) ON DELETE CASCADE,
    UNIQUE (site_version_id, revision),
    UNIQUE (site_version_id, batch_id)
);

CREATE INDEX site_operations_catchup
ON site_operations (site_version_id, revision);

