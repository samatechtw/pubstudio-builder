use serde::{Deserialize, Serialize};

use crate::entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity;

#[derive(Deserialize, Serialize)]
pub struct CustomDataInfoViewModel {
    pub id: String,
    pub name: String,
    pub columns: serde_json::Value,
    pub events: serde_json::Value,
}

pub fn to_api_response(entity: CustomDataInfoEntity) -> CustomDataInfoViewModel {
    return CustomDataInfoViewModel {
        id: entity.id.to_string(),
        name: entity.name,
        columns: entity.columns,
        events: entity.events,
    };
}
