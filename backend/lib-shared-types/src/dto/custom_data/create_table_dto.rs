use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::Validate;

use super::custom_event_dto::EventInfo;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateTable {
    pub table_name: String,
    pub columns: HashMap<String, ColumnInfo>,
    pub events: Vec<EventInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateTableResponse {
    pub id: String,
    pub name: String,
}

#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ColumnInfo {
    pub name: String,
    pub data_type: DataType,
    pub default: Option<String>,
    pub validation_rules: Vec<ValidationRule>,
}

// When modifying a column, the name is included separately in the DTO
#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ModifyColumnInfo {
    pub data_type: DataType,
    pub validation_rules: Vec<ValidationRule>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, EnumString, Display)]
pub enum DataType {
    TEXT,
    // Add more types here
}

#[derive(Deserialize, Serialize, Validate, Debug, Clone)]
#[serde(deny_unknown_fields)]
pub struct ValidationRule {
    pub rule_type: RuleType,
    pub parameter: Option<i32>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Clone)]
pub enum RuleType {
    Unique,
    Email,
    Required,
    MinLength,
    MaxLength,
    // Add more validation rules as needed
}
