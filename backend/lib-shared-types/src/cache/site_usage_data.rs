use serde::Serialize;

use crate::shared::js_date::JsDate;

#[derive(Debug, Clone, Serialize)]
pub struct SiteUsageData {
    pub site_size: u64,
    pub request_count: u64,
    pub request_error_count: u64,
    pub total_bandwidth: u64,
    pub bandwidth_allowance: u64,
    pub last_updated: JsDate,
}
