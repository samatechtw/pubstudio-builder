use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomDataInfoDto {
    pub name: String,
    pub columns: Value,
    pub events: Value,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomDataUpdateColumns {
    pub name: String,
    pub columns: Value,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomDataUpdateEvents {
    pub name: String,
    pub events: Value,
}
