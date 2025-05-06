use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
pub struct RecordPageViewDto {
    pub route: String,
}

#[derive(Serialize)]
pub struct RecordPageViewResponse {
    pub view_count: u64,
}
