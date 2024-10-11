use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::{Validate, ValidationError};

use crate::dto::validate::validate_vec_item_lengths;

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(deny_unknown_fields)]
#[serde(tag = "event_type")]
pub enum EventInfo {
    EmailRow {
        trigger: EventTrigger,
        options: EmailRowOptions,
    },
}

impl Validate for EventInfo {
    #[allow(unused_mut)]
    fn validate(&self) -> ::std::result::Result<(), ::validator::ValidationErrors> {
        let mut errors = ::validator::ValidationErrors::new();
        let mut result = if errors.is_empty() {
            ::std::result::Result::Ok(())
        } else {
            ::std::result::Result::Err(errors)
        };
        match self {
            #[allow(unused_variables)]
            EventInfo::EmailRow { trigger, options } => {
                ::validator::ValidationErrors::merge(result, "EmailRow", options.validate())
            }
        }
    }
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
