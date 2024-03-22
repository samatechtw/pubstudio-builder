use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct CustomDataInfoEntity {
    pub id: u32,
    pub name: String,
    pub columns: String,
}

#[derive(Debug)]
pub struct CustomDataInfoEntityResult {
    pub total: i64,
    pub results: Vec<CustomDataInfoEntity>,
}
