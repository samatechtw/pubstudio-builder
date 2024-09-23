use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct DeleteTable {
    pub table_name: String,
}
