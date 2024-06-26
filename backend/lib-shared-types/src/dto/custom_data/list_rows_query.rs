use serde::{Deserialize, Serialize};
use validator::Validate;

use super::CustomDataRow;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListRowsQuery {
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
    pub results: Vec<CustomDataRow>,
}

fn default_from() -> i32 {
    1
}

fn default_to() -> i32 {
    10
}
