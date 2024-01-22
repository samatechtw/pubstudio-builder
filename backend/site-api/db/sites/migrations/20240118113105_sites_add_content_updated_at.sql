ALTER TABLE
  site_versions
ADD COLUMN
  content_updated_at TIMESTAMP;

UPDATE site_versions SET content_updated_at = CURRENT_TIMESTAMP;
