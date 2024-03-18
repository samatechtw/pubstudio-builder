use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomDataInfoDto {
    pub name: String,
    pub columns: Value,
}
