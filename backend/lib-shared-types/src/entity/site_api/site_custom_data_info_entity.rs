use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct CustomDataInfoEntity {
    pub id: u32,
    pub name: String,
    pub columns: serde_json::Value,
    pub events: serde_json::Value,
}

#[derive(Debug)]
pub struct CustomDataInfoEntityList {
    pub total: i64,
    pub results: Vec<CustomDataInfoEntity>,
}
