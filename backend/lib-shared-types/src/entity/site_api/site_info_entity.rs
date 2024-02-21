use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct SiteInfoEntity {
    pub id: i64,
    pub name: String,
    pub updated_at: DateTime<Utc>,
    pub published: bool,
}
