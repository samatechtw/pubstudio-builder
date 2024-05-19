use serde::{Deserialize, Serialize};

use crate::entity::site_api::backup_entity::CreateBackupEntityResult;

#[derive(Serialize, Deserialize)]
pub struct CreateBackupResponse {
    pub site_id: String,
    pub url: String,
    pub count: u32,
}

impl From<CreateBackupEntityResult> for CreateBackupResponse {
    fn from(value: CreateBackupEntityResult) -> Self {
        CreateBackupResponse {
            site_id: value.site_id,
            url: value.url,
            count: value.count,
        }
    }
}
