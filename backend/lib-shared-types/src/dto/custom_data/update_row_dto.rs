use std::collections::{BTreeMap, HashMap};

use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct UpdateRow {
    pub table_name: String,
    pub row_id: i32,
    pub new_row: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateRowResponse {
    pub updated_row: BTreeMap<String, String>,
}
