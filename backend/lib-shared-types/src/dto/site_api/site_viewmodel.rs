use serde::Serialize;

use crate::{entity::site_api::site_entity::SiteEntity, shared::js_date::JsDate};

#[derive(Serialize)]
pub struct SiteViewModel {
    pub id: i64,
    pub name: String,
    pub version: String,
    pub context: String,
    pub defaults: String,
    pub editor: String,
    pub history: String,
    pub pages: String,
    pub created_at: JsDate,
    pub content_updated_at: i64,
    pub updated_at: JsDate,
    pub published: bool,
    pub preview_id: Option<String>,
}

pub fn to_api_response(site_entity: SiteEntity) -> SiteViewModel {
    SiteViewModel {
        id: site_entity.id,
        name: site_entity.name,
        version: site_entity.version,
        context: site_entity.context,
        defaults: site_entity.defaults,
        history: site_entity.history,
        editor: site_entity.editor,
        pages: site_entity.pages,
        created_at: JsDate {
            timestamp: site_entity.created_at,
        },
        content_updated_at: site_entity.content_updated_at,
        updated_at: JsDate {
            timestamp: site_entity.updated_at,
        },
        published: site_entity.published,
        preview_id: site_entity.preview_id,
    }
}
