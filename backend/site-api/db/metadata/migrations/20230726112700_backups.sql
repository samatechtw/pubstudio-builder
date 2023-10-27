CREATE TABLE IF NOT EXISTS backups
(
    id           INTEGER PRIMARY KEY NOT NULL,
    site_id      TEXT                NOT NULL,
    url          TEXT                NOT NULL,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pinned       BOOLEAN DEFAULT     FALSE,
    CONSTRAINT fk_site_id FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE TRIGGER IF NOT EXISTS update_timestamp
BEFORE UPDATE ON backups
BEGIN
  UPDATE backups
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = old.id;
END;
