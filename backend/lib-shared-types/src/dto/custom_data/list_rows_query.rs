use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListRowsQuery {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    #[serde(default = "default_from")]
    #[validate(range(min = 1))]
    pub from: i32,
    #[serde(default = "default_to")]
    #[validate(range(min = 1))]
    pub to: i32,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ListRowsResponse {
    pub total: i64,
    pub results: Vec<BTreeMap<String, String>>,
}

fn default_from() -> i32 {
    1
}

fn default_to() -> i32 {
    10
}
