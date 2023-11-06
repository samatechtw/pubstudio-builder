use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::entity::site_api::site_entity::SiteEntity;

#[derive(Serialize)]
pub struct GetSiteDto {
    pub id: i64,
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub editor: Option<String>,
    pub history: Option<String>,
    pub pages: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub published: Option<bool>,
    pub disabled: Option<bool>,
}

#[derive(Deserialize)]
pub struct GetSiteQuery {
    pub update_key: Option<u16>,
}

impl GetSiteDto {
    pub fn default() -> Self {
        Self {
            id: 0,
            name: "".to_string(),
            version: "".to_string(),
            context: "".to_string(),
            defaults: "".to_string(),
            history: None,
            editor: None,
            pages: "".to_string(),
            created_at: None,
            updated_at: None,
            published: None,
            disabled: None,
        }
    }
}

pub fn to_api_response(site_entity: SiteEntity, with_editor: bool, disabled: bool) -> GetSiteDto {
    return if with_editor {
        GetSiteDto {
            id: site_entity.id,
            name: site_entity.name,
            version: site_entity.version,
            context: site_entity.context,
            defaults: site_entity.defaults,
            history: Some(site_entity.history),
            editor: Some(site_entity.editor),
            pages: site_entity.pages,
            created_at: Some(site_entity.created_at),
            updated_at: Some(site_entity.updated_at),
            published: Some(site_entity.published),
            disabled: Some(disabled),
        }
    } else {
        GetSiteDto {
            id: site_entity.id,
            name: site_entity.name,
            version: site_entity.version,
            context: site_entity.context,
            defaults: site_entity.defaults,
            history: None,
            editor: None,
            pages: site_entity.pages,
            created_at: None,
            updated_at: None,
            published: None,
            disabled: None,
        }
    };
}
