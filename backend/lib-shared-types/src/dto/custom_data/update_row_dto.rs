use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use validator::Validate;

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
