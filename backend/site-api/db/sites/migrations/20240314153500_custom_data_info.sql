CREATE TABLE IF NOT EXISTS custom_data_info
(
    id           INTEGER PRIMARY KEY NOT NULL,
    name         TEXT                NOT NULL,
    columns      TEXT                NOT NULL,
    events       TEXT                NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_timestamp
BEFORE UPDATE ON custom_data_info
BEGIN
  UPDATE custom_data_info
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = old.id;
END;
