use std::collections::HashMap;

use serde::Deserialize;
use validator::Validate;

use super::create_table_dto::ColumnInfo;

#[derive(Deserialize, Validate, Clone)]
#[serde(deny_unknown_fields)]
pub struct AddColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub column: HashMap<String, ColumnInfo>,
}
