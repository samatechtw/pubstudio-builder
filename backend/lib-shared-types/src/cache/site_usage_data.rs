use serde::Serialize;

use crate::shared::js_date::JsDate;

#[derive(Debug, Clone, Serialize)]
pub struct SiteUsageData {
    pub site_size: u64,
    // All requests in the last ~day
    pub request_count: u64,
    // Total site requests
    pub total_request_count: u64,
    // Site views in the last ~day
    pub site_view_count: u64,
    // Total site views
    pub total_site_view_count: u64,
    pub request_error_count: u64,
    // Bandwidth used in the last ~day
    pub total_bandwidth: u64,
    // Bandwidth used since the beginning of the month
    pub current_monthly_bandwidth: u64,
    pub bandwidth_allowance: u64,
    pub last_updated: JsDate,
}
