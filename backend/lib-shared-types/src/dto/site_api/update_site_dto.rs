use crate::type_util::REGEX_DATE;
use crate::type_util::REGEX_SITE_NAME;
use serde::{Deserialize, Serialize};
use serde_json;
use validator::Validate;

#[derive(Serialize, Deserialize, Validate, Clone, Debug)]
#[serde(deny_unknown_fields)]
pub struct UpdateSiteDto {
    #[validate(regex(path = "*REGEX_SITE_NAME"))]
    pub name: Option<String>,
    pub version: Option<String>,
    pub context: Option<serde_json::Value>,
    pub defaults: Option<serde_json::Value>,
    pub editor: Option<serde_json::Value>,
    pub history: Option<serde_json::Value>,
    pub pages: Option<serde_json::Value>,
    #[serde(rename = "pageOrder")]
    pub page_order: Option<serde_json::Value>,
    pub disabled: Option<bool>,
    #[validate(regex(path = "*REGEX_DATE"))]
    pub update_key: Option<String>,
    pub enable_preview: Option<bool>,
}

pub struct UpdateSiteDtoWithContentUpdatedAt {
    pub dto: UpdateSiteDto,
    pub content_updated_at: Option<i64>,
}
