use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::entity::site_api::site_entity::SiteEntity;

#[derive(Deserialize, Validate)]
pub struct GetCurrentSiteQuery {
    pub p: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetCurrentSiteResponse {
    pub id: String,
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub pages: String,
    pub published: bool,
    // Freshness key for generated static pages (see static_pages)
    #[serde(default)]
    pub content_updated_at: i64,
}

pub fn to_api_response(site: &SiteEntity, site_id: &str) -> GetCurrentSiteResponse {
    GetCurrentSiteResponse {
        id: site_id.to_string(),
        name: site.name.clone(),
        version: site.version.clone(),
        context: site.context.clone(),
        defaults: site.defaults.clone(),
        pages: site.pages.clone(),
        published: site.published,
        content_updated_at: site.content_updated_at,
    }
}

impl GetCurrentSiteResponse {
    pub fn calculate_site_size(&self) -> u64 {
        (self.context.bytes().len() + self.defaults.bytes().len() + self.pages.bytes().len()) as u64
    }
}
