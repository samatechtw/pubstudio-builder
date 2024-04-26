use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::Validate;

#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct EventInfo {
    pub event_type: EventType,
    pub trigger: EventTrigger,
    pub options: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, Copy, EnumString, Display)]
pub enum EventType {
    EmailRow,
    // Add more events here
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, Copy, EnumString, Display)]
pub enum EventTrigger {
    AddRow,
    // Add more event triggers here
}

#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct EmailRowOptions {
    pub recipients: Vec<String>,
}
