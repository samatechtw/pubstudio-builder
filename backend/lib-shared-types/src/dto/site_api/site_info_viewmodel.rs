use serde::Serialize;

use crate::{entity::site_api::site_info_entity::SiteInfoEntity, shared::js_date::JsDate};

#[derive(Serialize)]
pub struct SiteInfoViewModel {
    pub id: i64,
    pub name: String,
    pub updated_at: JsDate,
    pub published: bool,
}

pub fn to_api_response(site_entity: SiteInfoEntity) -> SiteInfoViewModel {
    SiteInfoViewModel {
        id: site_entity.id,
        name: site_entity.name,
        updated_at: JsDate {
            timestamp: site_entity.updated_at,
        },
        published: site_entity.published,
    }
}
