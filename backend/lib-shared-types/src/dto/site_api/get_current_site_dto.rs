use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::entity::site_api::site_entity::SiteEntity;

#[derive(Deserialize, Validate)]
pub struct GetCurrentSiteQuery {
    pub p: Option<String>,
}

#[derive(Serialize)]
pub struct GetCurrentSiteResponse {
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub pages: String,
}

pub fn to_api_response(site: &SiteEntity, filtered_pages: String) -> GetCurrentSiteResponse {
    return GetCurrentSiteResponse {
        name: site.name.clone(),
        version: site.version.clone(),
        context: site.context.clone(),
        defaults: site.defaults.clone(),
        pages: filtered_pages,
    };
}
