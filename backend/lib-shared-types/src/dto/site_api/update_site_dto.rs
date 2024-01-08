use crate::type_util::REGEX_SITE_NAME;
use crate::type_util::REGEX_DATE;
use serde::{Deserialize, Serialize};
use serde_json;
use validator::Validate;

#[derive(Serialize, Deserialize, Validate, Clone, Debug)]
#[serde(deny_unknown_fields)]
pub struct UpdateSiteDto {
    #[validate(regex = "REGEX_SITE_NAME")]
    pub name: Option<String>,
    pub version: Option<String>,
    pub context: Option<serde_json::Value>,
    pub defaults: Option<serde_json::Value>,
    pub editor: Option<serde_json::Value>,
    pub history: Option<serde_json::Value>,
    pub pages: Option<serde_json::Value>,
    pub published: Option<bool>,
    pub disabled: Option<bool>,
    #[validate(regex = "REGEX_DATE")]
    pub update_key: Option<String>,
}
