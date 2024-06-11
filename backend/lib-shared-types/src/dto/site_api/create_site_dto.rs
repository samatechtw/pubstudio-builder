use crate::{
    shared::site::SiteType,
    type_util::{REGEX_SITE_NAME, REGEX_UUID},
};
use serde::{Deserialize, Serialize};
use serde_json;
use validator::Validate;

#[derive(Debug, Clone, Deserialize, Serialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateSiteDto {
    #[validate(regex(path = "*REGEX_UUID"))]
    pub id: String,
    #[validate(regex(path = "*REGEX_UUID"))]
    pub owner_id: String,
    #[validate(email)]
    pub owner_email: String,
    #[validate(regex(path = "*REGEX_SITE_NAME"))]
    pub name: String,
    pub version: String,
    pub context: serde_json::Value,
    pub defaults: serde_json::Value,
    pub editor: serde_json::Value,
    pub history: serde_json::Value,
    pub pages: serde_json::Value,
    #[serde(rename = "pageOrder")]
    pub page_order: serde_json::Value,
    pub published: bool,
    pub domains: Vec<String>,
    pub site_type: SiteType,
}

#[derive(Serialize)]
pub struct CreateSiteResponse {
    pub id: String,
}
