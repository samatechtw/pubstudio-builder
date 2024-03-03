use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::entity::site_api::site_entity::SiteEntity;

#[derive(Deserialize, Validate)]
pub struct GetCurrentSiteQuery {
    pub p: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct GetCurrentSiteResponse {
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub pages: String,
    pub published: bool,
}

pub fn to_api_response(site: &SiteEntity) -> GetCurrentSiteResponse {
    GetCurrentSiteResponse {
        name: site.name.clone(),
        version: site.version.clone(),
        context: site.context.clone(),
        defaults: site.defaults.clone(),
        pages: site.pages.clone(),
        published: site.published,
    }
}

impl GetCurrentSiteResponse {
    pub fn calculate_site_size(&self) -> u64 {
        (self.context.bytes().len() + self.defaults.bytes().len() + self.pages.bytes().len()) as u64
    }
}
