ALTER TABLE site_usage
  ADD COLUMN site_view_count BIGINT NOT NULL DEFAULT 0;

ALTER TABLE site_usage
  ADD COLUMN page_views TEXT NOT NULL DEFAULT '{}';
