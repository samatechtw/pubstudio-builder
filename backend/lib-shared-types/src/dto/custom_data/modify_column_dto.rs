use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ModifyColumn {
    #[validate(length(min = 1, max = 100))]
    pub table_name: String,
    pub old_column_name: String,
    pub new_column_name: String,
}
