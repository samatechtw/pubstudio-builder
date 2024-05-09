ALTER TABLE
  sites
ADD COLUMN
  custom_data_usage INTEGER DEFAULT 0;

ALTER TABLE
  sites
ADD COLUMN
  owner_email TEXT DEFAULT "sam@samatech.tw";
