use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct BackupEntity {
    pub id: u32,
    pub site_id: String,
    pub url: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct CreateBackupEntityResult {
    pub id: u32,
    pub site_id: String,
    pub url: String,
    pub count: u32,
}
