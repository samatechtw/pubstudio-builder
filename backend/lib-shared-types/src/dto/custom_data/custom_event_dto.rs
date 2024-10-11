use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::{Validate, ValidationError};

use crate::dto::validate::validate_vec_item_lengths;

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
    UpdateRow,
    // Add more event triggers here
}

fn validate_email_row_options(data: &EmailRowOptions) -> Result<(), ValidationError> {
    Ok(validate_vec_item_lengths(&data.recipients, 0, 100)?)
}

#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
#[validate(schema(function = "validate_email_row_options", skip_on_field_errors = false))]
pub struct EmailRowOptions {
    #[validate(length(min = 1, max = 10))]
    pub recipients: Vec<String>,
}
