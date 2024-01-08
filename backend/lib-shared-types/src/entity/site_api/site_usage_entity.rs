use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct SiteUsageEntity {
    pub id: u32,
    pub site_id: String,
    pub request_count: i64,
    pub request_error_count: i64,
    pub total_bandwidth: i64,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}
