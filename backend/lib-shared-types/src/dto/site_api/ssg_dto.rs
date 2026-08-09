use serde::{Deserialize, Serialize};

use crate::entity::site_api::site_entity::SiteEntity;

#[derive(Debug, Serialize)]
pub struct SsgSiteInput {
    pub id: String,
    pub name: String,
    pub version: String,
    pub defaults: String,
    pub context: String,
    pub pages: String,
    #[serde(rename = "pageOrder")]
    pub page_order: String,
    // Millisecond timestamp used for sitemap lastmod
    pub updated_at: i64,
}

#[derive(Debug, Serialize)]
pub struct SsgOptions {
    #[serde(rename = "baseUrl", skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,
    #[serde(rename = "runtimeSrc")]
    pub runtime_src: String,
}

#[derive(Debug, Serialize)]
pub struct SsgGenerateRequest {
    pub site: SsgSiteInput,
    pub options: SsgOptions,
}

#[derive(Debug, Deserialize)]
pub struct SsgGeneratedPage {
    pub route: String,
    pub body: String,
    #[serde(rename = "contentType")]
    pub content_type: String,
}

#[derive(Debug, Deserialize)]
pub struct SsgGenerateResponse {
    pub pages: Vec<SsgGeneratedPage>,
    #[serde(default)]
    pub warnings: Vec<String>,
    #[serde(default)]
    pub blockers: Vec<String>,
    pub generator: String,
}

// Response for GET /api/sites/{id}/static_pages?path=..., used by
// platform-api to serve static pages for platform-subdomain requests
#[derive(Debug, Serialize, Deserialize)]
pub struct StaticPageViewModel {
    pub route: String,
    pub body: String,
    pub content_type: String,
}

#[derive(Debug, Deserialize)]
pub struct GetStaticPageQuery {
    pub path: String,
}

pub fn site_to_ssg_input(site: &SiteEntity, site_id: &str) -> SsgSiteInput {
    SsgSiteInput {
        id: site_id.to_string(),
        name: site.name.clone(),
        version: site.version.clone(),
        defaults: site.defaults.clone(),
        context: site.context.clone(),
        pages: site.pages.clone(),
        page_order: site.page_order.clone(),
        updated_at: site.content_updated_at,
    }
}
