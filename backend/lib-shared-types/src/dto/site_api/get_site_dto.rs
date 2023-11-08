use serde::{Deserialize, Serialize};

use crate::{entity::site_api::site_entity::SiteEntity, shared::js_date::JsDate};

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
    pub created_at: Option<JsDate>,
    pub updated_at: Option<JsDate>,
    pub published: Option<bool>,
    pub disabled: Option<bool>,
}

#[derive(Deserialize)]
pub struct GetSiteQuery {
    pub update_key: Option<String>,
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
            created_at: Some(JsDate {
                timestamp: site_entity.created_at,
            }),
            updated_at: Some(JsDate {
                timestamp: site_entity.updated_at,
            }),
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
