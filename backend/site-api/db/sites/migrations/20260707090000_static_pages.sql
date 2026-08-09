-- SSG pages for the published site version. Rows are replaced wholesale on publish,
-- `content_updated_at` matches published site_versions row at generation time.
CREATE TABLE IF NOT EXISTS static_pages (
    route TEXT PRIMARY KEY NOT NULL,
    body TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_updated_at INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
