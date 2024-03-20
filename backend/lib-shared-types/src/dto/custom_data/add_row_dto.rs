use std::collections::HashMap;

use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct AddRow {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub values: HashMap<String, String>,
}
