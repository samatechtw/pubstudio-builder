use serde::{Deserialize, Serialize};
use validator::Validate;

use super::custom_data_info_viewmodel::CustomDataInfoViewModel;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListTablesQuery {
    #[serde(default = "default_from")]
    #[validate(range(min = 1))]
    pub from: i32,
    #[serde(default = "default_to")]
    #[validate(range(min = 1))]
    pub to: i32,
}

fn default_from() -> i32 {
    1
}

fn default_to() -> i32 {
    10
}

impl ListTablesQuery {
    pub fn default() -> ListTablesQuery {
        Self {
            from: default_from(),
            to: default_to(),
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct ListTablesResponse {
    pub total: i64,
    pub results: Vec<CustomDataInfoViewModel>,
}
