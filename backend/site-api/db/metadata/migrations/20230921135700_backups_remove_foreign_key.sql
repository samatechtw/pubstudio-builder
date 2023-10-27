CREATE TABLE
    backups_new(
        id INTEGER PRIMARY KEY NOT NULL,
        site_id TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        pinned BOOLEAN DEFAULT FALSE
    );

INSERT INTO backups_new SELECT * FROM backups;

DROP TABLE backups;

ALTER TABLE backups_new RENAME TO backups;