ALTER TABLE
  sites
ADD COLUMN
  content_updated_at timestamp with time zone
DEFAULT now() NOT NULL;
