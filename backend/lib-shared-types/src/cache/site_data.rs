use serde::{Deserialize, Serialize};

use crate::dto::site_api::get_current_site_dto::GetCurrentSiteResponse;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedSiteHead {
    pub title: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CachedSiteData {
    pub site: GetCurrentSiteResponse,
    // Pre-processed data to simplify serving the site
    pub meta: CachedSiteHead,
}
