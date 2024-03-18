use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use validator::Validate;

use super::create_table_dto::ColumnInfo;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct AddColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub column: HashMap<String, ColumnInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateColumnResponse {
    pub updated_column: serde_json::Value,
}
