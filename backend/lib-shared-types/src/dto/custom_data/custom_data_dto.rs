use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CustomDataDto {
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
