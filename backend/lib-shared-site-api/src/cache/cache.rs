use lib_shared_types::{
    entity::site_api::site_usage_entity::SiteUsageEntity,
    shared::{core::ExecEnv, js_date::JsDate, site::SiteType},
};
use moka::future::Cache;
use serde::Serialize;

use crate::error::api_error::ApiError;

#[derive(Debug, Clone, Serialize)]
pub struct CacheSiteData {
    pub site_size: u64,
    pub request_count: u64,
    pub request_error_count: u64,
    pub total_bandwidth: u64,
    pub bandwidth_allowance: u64,
    pub last_updated: JsDate,
}

pub type SiteDataCache = Cache<String, CacheSiteData>;

#[derive(Clone)]
pub struct AppCache {
    pub cache: SiteDataCache,
    exec_env: ExecEnv,
}

impl AppCache {
    pub fn new(exec_env: ExecEnv) -> AppCache {
        // Create a cache that can store up to 10,000 entries.
        let cache = Cache::new(10_000);
        AppCache { cache, exec_env }
    }

    async fn get_or_create(
        &self,
        site_id: &str,
        site_size: u64,
        site_type: SiteType,
    ) -> CacheSiteData {
        if let Some(data) = self.cache.get(site_id).await {
            data
        } else {
            CacheSiteData {
                site_size,
                request_count: 0,
                request_error_count: 0,
                total_bandwidth: 0,
                last_updated: JsDate::now(),
                bandwidth_allowance: site_type.get_bandwidth_allowance(self.exec_env),
            }
        }
    }

    pub async fn get_cache(&self, site_id: &str) -> Result<CacheSiteData, ApiError> {
        match self.cache.get(site_id).await {
            Some(data) => Ok(data),
            None => Err(ApiError::bad_request()
                .message(format!("Site with ID {} not found in cache", site_id))),
        }
    }

    pub async fn sync(&self) {
        self.cache.run_pending_tasks().await;
    }

    pub async fn create_or_update_cache(&self, site_id: &str, site_size: u64, site_type: SiteType) {
        let mut data = self.get_or_create(site_id, site_size, site_type).await;

        data.site_size = site_size;
        data.request_count += 1;
        data.total_bandwidth = data.site_size * data.request_count;
        data.last_updated = JsDate::now();

        self.cache.insert(site_id.to_string(), data).await;
    }

    pub async fn increase_request_count(&self, site_id: &str, site_size: u64, site_type: SiteType) {
        let mut data = self.get_or_create(site_id, site_size, site_type).await;

        data.request_count += 1;
        data.total_bandwidth = data.site_size * data.request_count;
        data.last_updated = JsDate::now();

        self.cache.insert(site_id.to_string(), data).await;
    }

    pub async fn increase_request_error_count(
        &self,
        site_id: &str,
        site_size: u64,
        site_type: SiteType,
    ) {
        let mut data = self.get_or_create(site_id, site_size, site_type).await;

        data.request_error_count += 1;
        data.last_updated = JsDate::now();

        self.cache.insert(site_id.to_string(), data).await;
    }

    pub async fn check_bandwidth_exceeded(
        &self,
        site_id: &str,
        site_size: u64,
        site_type: SiteType,
    ) -> Result<(), ApiError> {
        let data = self.get_or_create(site_id, site_size, site_type).await;

        if data.total_bandwidth != 0 && data.total_bandwidth > data.bandwidth_allowance {
            return Err(ApiError::bandwidth_exceeded());
        }

        Ok(())
    }

    pub async fn reset_bandwidth(&self) {
        for (site_id, mut site_data) in self.cache.iter() {
            site_data.request_count = 0;
            site_data.request_error_count = 0;
            site_data.total_bandwidth = 0;
            site_data.last_updated = JsDate::now();

            self.cache.insert(site_id.to_string(), site_data).await;
        }
    }

    pub async fn reset_cache(&self, usage: &SiteUsageEntity, site_size: u64, site_type: SiteType) {
        let data = CacheSiteData {
            site_size,
            request_count: usage.request_count as u64,
            request_error_count: usage.request_error_count as u64,
            total_bandwidth: usage.total_bandwidth as u64,
            last_updated: JsDate::now(),
            bandwidth_allowance: site_type.get_bandwidth_allowance(self.exec_env),
        };
        self.cache.insert(usage.site_id.clone(), data).await;
    }
}
