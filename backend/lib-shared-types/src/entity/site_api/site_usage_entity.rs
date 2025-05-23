use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct SiteUsageEntity {
    pub id: u32,
    pub site_id: String,
    pub request_count: i64,
    pub site_view_count: i64,
    pub request_error_count: i64,
    pub total_bandwidth: i64,
    pub page_views: HashMap<String, u64>,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SiteUsageTotals {
    pub id: u32,
    pub site_id: String,
    pub total_request_count: i64,
    pub total_site_view_count: i64,
    pub current_monthly_bandwidth: u64,
    pub total_page_views: HashMap<String, u64>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SiteUsageEntityWithTotals {
    pub id: u32,
    pub site_id: String,
    pub request_count: i64,
    pub total_request_count: i64,
    pub site_view_count: i64,
    pub total_site_view_count: i64,
    pub request_error_count: i64,
    pub total_bandwidth: i64,
    pub current_monthly_bandwidth: u64,
    pub page_views: HashMap<String, u64>,
    pub total_page_views: HashMap<String, u64>,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}
