use serde::Serialize;

use crate::{
    cache::site_usage_data::SiteUsageData,
    shared::{js_date::JsDate, site::SiteType},
};

#[derive(Debug, Clone, Serialize)]
pub struct SiteUsageViewModel {
    pub site_size: u64,
    pub max_context_length: u64,
    pub max_history_length: u64,
    pub max_pages_length: u64,
    pub request_count: u64,
    pub request_error_count: u64,
    pub total_bandwidth: u64,
    pub bandwidth_allowance: u64,
    pub custom_data_usage: i64,
    pub custom_data_allowance: i64,
    pub last_updated: JsDate,
}

pub fn from_usage_data(
    data: SiteUsageData,
    site_type: SiteType,
    custom_data_usage: i64,
    custom_data_allowance: i64,
) -> SiteUsageViewModel {
    SiteUsageViewModel {
        site_size: data.site_size,
        max_context_length: site_type.get_max_context_length(),
        max_history_length: site_type.get_max_history_length(),
        max_pages_length: site_type.get_max_pages_length(),
        request_count: data.request_count,
        request_error_count: data.request_error_count,
        total_bandwidth: data.total_bandwidth,
        bandwidth_allowance: data.bandwidth_allowance,
        custom_data_usage,
        custom_data_allowance,
        last_updated: data.last_updated,
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct PublicSiteUsageViewModel {
    pub request_count: u64,
    pub last_updated: JsDate,
}

impl From<SiteUsageData> for PublicSiteUsageViewModel {
    fn from(value: SiteUsageData) -> Self {
        PublicSiteUsageViewModel {
            request_count: value.request_count,
            last_updated: value.last_updated,
        }
    }
}
