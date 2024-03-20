use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct RemoveColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub column_name: String,
}
