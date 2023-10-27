CREATE TABLE IF NOT EXISTS site_versions
(
    id           INTEGER PRIMARY KEY NOT NULL,
    name         TEXT                NOT NULL,
    version      TEXT                NOT NULL,
    context      TEXT                NOT NULL,
    defaults     TEXT                NOT NULL,
    editor       TEXT                NOT NULL,
    history      TEXT                NOT NULL,
    pages        TEXT                NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published    BOOLEAN DEFAULT     FALSE
);

CREATE TRIGGER IF NOT EXISTS update_timestamp
BEFORE UPDATE ON site_versions
BEGIN
  UPDATE site_versions
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = old.id;
END;
