use serde::Deserialize;
use validator::Validate;

use super::create_table_dto::ColumnInfo;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ModifyColumn {
    pub table_name: String,
    pub old_column_name: String,
    pub new_column_name: Option<String>,
    pub new_column_info: Option<ColumnInfo>,
}
