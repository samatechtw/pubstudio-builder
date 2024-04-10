use std::collections::HashMap;

use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct AddRow {
    pub table_name: String,
    pub row: HashMap<String, String>,
}
