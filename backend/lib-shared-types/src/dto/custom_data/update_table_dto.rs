use serde::Deserialize;
use validator::Validate;

use super::custom_event_dto::EventInfo;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct UpdateTable {
    pub old_name: String,
    pub new_name: Option<String>,
    pub events: Option<Vec<EventInfo>>,
}
