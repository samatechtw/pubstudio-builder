use serde::{Deserialize, Serialize};
use serde_json;
use validator::Validate;

#[derive(Serialize, Deserialize, Validate, Clone, Debug)]
#[serde(deny_unknown_fields)]
pub struct UpdateSiteDto {
    #[validate(length(min = 1, max = 50))]
    pub name: Option<String>,
    pub version: Option<String>,
    pub context: Option<serde_json::Value>,
    pub defaults: Option<serde_json::Value>,
    pub editor: Option<serde_json::Value>,
    pub history: Option<serde_json::Value>,
    pub pages: Option<serde_json::Value>,
    pub published: Option<bool>,
    pub disabled: Option<bool>,
}
