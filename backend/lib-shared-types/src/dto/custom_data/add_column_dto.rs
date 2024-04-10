use std::collections::HashMap;

use serde::Deserialize;
use validator::Validate;

use super::create_table_dto::ColumnInfo;

#[derive(Deserialize, Validate, Clone)]
#[serde(deny_unknown_fields)]
pub struct AddColumn {
    pub table_name: String,
    pub column: HashMap<String, ColumnInfo>,
}
