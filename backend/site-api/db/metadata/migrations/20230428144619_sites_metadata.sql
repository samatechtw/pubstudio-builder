CREATE TABLE IF NOT EXISTS sites
(
    id          TEXT NOT NULL PRIMARY KEY,
    location    TEXT NOT NULL,
    owner_id    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS domains
(
    id          INTEGER PRIMARY KEY NOT NULL,
    domain      TEXT                NOT NULL,
    site_id     TEXT                NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT  fk_site_id FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
