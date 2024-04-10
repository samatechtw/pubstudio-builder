use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct RemoveColumn {
    pub table_name: String,
    pub column_name: String,
}
