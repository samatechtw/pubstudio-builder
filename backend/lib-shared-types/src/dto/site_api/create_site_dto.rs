use crate::{
    shared::site::SiteType,
    type_util::{REGEX_SITE_NAME, REGEX_UUID},
};
use serde::{Deserialize, Serialize};
use serde_json;
use validator::Validate;

#[derive(Debug, Deserialize, Serialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateSiteDto {
    #[validate(regex = "REGEX_UUID")]
    pub id: String,
    #[validate(regex = "REGEX_UUID")]
    pub owner_id: String,
    #[validate(regex = "REGEX_SITE_NAME")]
    pub name: String,
    pub version: String,
    pub context: serde_json::Value,
    pub defaults: serde_json::Value,
    pub editor: serde_json::Value,
    pub history: serde_json::Value,
    pub pages: serde_json::Value,
    pub published: bool,
    pub domains: Vec<String>,
    pub site_type: SiteType,
}

#[derive(Serialize)]
pub struct CreateSiteResponse {
    pub id: String,
}
