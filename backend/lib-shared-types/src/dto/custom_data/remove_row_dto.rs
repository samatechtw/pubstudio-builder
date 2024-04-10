use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate, Debug)]
#[serde(deny_unknown_fields)]
pub struct RemoveRow {
    pub table_name: String,
    pub row_id: String,
}
