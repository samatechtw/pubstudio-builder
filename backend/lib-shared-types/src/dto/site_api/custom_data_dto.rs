use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CustomTableDto {
    pub action: Action,
    pub data: serde_json::Value,
}

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum Action {
    CreateTable,
    AddRow,
    ListTables,
    ListRows,
    UpdateRow,
    AddColumn,
    RemoveColumn,
    ModifyColumn,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateTable {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub columns: HashMap<String, ColumnInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateTableResponse {
    pub id: String,
}

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct ColumnInfo {
    pub data_type: DataType,
    pub validation_rules: Vec<ValidationRule>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum DataType {
    TEXT,
    // Add more types if needed
}

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct ValidationRule {
    pub rule_type: RuleType,
    pub parameters: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum RuleType {
    Required,
    Unique,
    Email,
    MinLength,
    MaxLength,
    // Add more validation rules if needed
}

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct AddRow {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub values: HashMap<String, String>,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListTables {
    pub from: Option<i32>,
    pub to: Option<i32>,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListRows {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub from: Option<i32>,
    pub to: Option<i32>,
}

#[derive(Deserialize, Serialize)]
pub struct ListResponse {
    pub total: usize,
    pub results: Vec<serde_json::Value>,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct UpdateRow {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub row_id: i32,
    pub new_row: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateRowResponse {
    pub updated_row: serde_json::Value,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct AddColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub column: HashMap<String, ColumnInfo>,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct RemoveColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub column_name: String,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ModifyColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub old_column_name: String,
    pub new_column_name: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateColumnResponse {
    pub updated_column: serde_json::Value,
}
