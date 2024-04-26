use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct AddRow {
    pub table_name: String,
    pub row: HashMap<String, String>,
}

#[derive(Serialize)]
pub struct AddRowResponse {
    pub events: i32,
}
