use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct SiteEntity {
    pub id: i64,
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub editor: String,
    pub history: String,
    pub pages: String,
    pub page_order: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub content_updated_at: i64,
    pub published: bool,
    pub preview_id: Option<String>,
}

impl SiteEntity {
    pub fn calculate_site_size(&self) -> u64 {
        (self.context.bytes().len() + self.defaults.bytes().len() + self.pages.bytes().len()) as u64
    }
}
