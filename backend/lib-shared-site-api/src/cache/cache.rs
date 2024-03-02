use std::{borrow::Borrow, future::Future};

use lib_shared_types::{
    dto::site_api::get_current_site_dto::GetCurrentSiteResponse,
    entity::site_api::{site_entity::SiteEntity, site_usage_entity::SiteUsageEntity},
    shared::{core::ExecEnv, js_date::JsDate, site::SiteType},
};
use moka::future::Cache;
use serde::Serialize;
use serde_json::{json, Map, Value};

use crate::error::api_error::ApiError;

#[derive(Debug, Clone, Serialize)]
pub struct SiteUsageData {
    pub site_size: u64,
    pub request_count: u64,
    pub request_error_count: u64,
    pub total_bandwidth: u64,
    pub bandwidth_allowance: u64,
    pub last_updated: JsDate,
    pub site_data: Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct SiteMetadata {
    pub owner_id: String,
    pub site_type: SiteType,
    pub disabled: bool,
}

pub type SiteUsageCache = Cache<String, SiteUsageData>; // key: site_id, value: SiteUsageData
pub type SiteDomainCache = Cache<String, String>; // key: domain, value: site_id
pub type SiteMetadataCache = Cache<String, SiteMetadata>; // key: site_id, value: SiteMetadata

#[derive(Clone)]
pub struct AppCache {
    pub cache: SiteUsageCache,
    pub domain_cache: SiteDomainCache,
    pub metadata_cache: SiteMetadataCache,
    exec_env: ExecEnv,
}

fn site_to_value(site: &SiteEntity) -> Result<GetCurrentSiteResponse, serde_json::Error> {
    let unwrapped_pages: String = serde_json::from_str(&site.pages)?;
    let mut pages: Map<String, Value> = serde_json::from_str(&unwrapped_pages)?;

    let mut filtered_json = Map::new();
    for (key, value) in pages.iter_mut() {
        if let Some(public) = value.get("public").and_then(Value::as_bool) {
            if public {
                filtered_json.insert(key.clone(), value.clone());
            }
        }
    }
    let pages_json = serde_json::to_string(&filtered_json)?;
    let filtered_pages = serde_json::to_string(&pages_json)?;
    Ok(GetCurrentSiteResponse {
        name: site.name.clone(),
        version: site.version.clone(),
        context: site.context.clone(),
        defaults: site.defaults.clone(),
        pages: filtered_pages,
        published: site.published,
    })
}

impl AppCache {
    pub fn new(exec_env: ExecEnv) -> AppCache {
        // Create a cache that can store up to 10,000 entries.
        let cache = Cache::new(10_000);
        let domain_cache = Cache::new(10_000);
        let metadata_cache = Cache::new(10_000);
        AppCache {
            cache,
            domain_cache,
            metadata_cache,
            exec_env,
        }
    }

    // SiteUsage
    async fn get_with_usage(
        &self,
        site_id: &str,
        site: &GetCurrentSiteResponse,
        site_type: SiteType,
    ) -> SiteUsageData {
        self.cache
            .get_with(site_id.to_string(), async move {
                SiteUsageData {
                    site_size: site.calculate_site_size(),
                    request_count: 0,
                    request_error_count: 0,
                    total_bandwidth: 0,
                    last_updated: JsDate::now(),
                    bandwidth_allowance: site_type.get_bandwidth_allowance(self.exec_env),
                    site_data: serde_json::to_value(site).unwrap_or(json!({})),
                }
            })
            .await
    }

    pub async fn get_usage(&self, site_id: &str) -> Result<SiteUsageData, ApiError> {
        match self.cache.get(site_id).await {
            Some(data) => Ok(data),
            None => Err(ApiError::bad_request()
                .message(format!("Site with ID {} not found in cache", site_id))),
        }
    }

    pub async fn sync(&self) {
        self.cache.run_pending_tasks().await;
    }

    pub async fn create_or_update_usage(
        &self,
        site_id: &str,
        site: &SiteEntity,
        site_type: SiteType,
    ) {
        if let Ok(site_value) = site_to_value(site) {
            let mut data = self.get_with_usage(site_id, &site_value, site_type).await;

            data.site_size = site.calculate_site_size();
            data.request_count += 1;
            data.total_bandwidth = data.site_size * data.request_count;
            data.last_updated = JsDate::now();
            if site.published {
                data.site_data = serde_json::to_value(site_value).unwrap_or(json!({}));
            }

            self.cache.insert(site_id.to_string(), data).await;
        }
    }

    pub async fn increase_request_count(
        &self,
        site_id: &str,
        site: &GetCurrentSiteResponse,
        site_type: SiteType,
    ) {
        let mut data = self.get_with_usage(site_id, site, site_type).await;

        data.request_count += 1;
        data.total_bandwidth = data.site_size * data.request_count;
        data.last_updated = JsDate::now();

        self.cache.insert(site_id.to_string(), data).await;
    }

    pub async fn increase_request_error_count(
        &self,
        site_id: &str,
        site: &GetCurrentSiteResponse,
        site_type: SiteType,
    ) {
        let mut data = self.get_with_usage(site_id, site, site_type).await;

        data.request_error_count += 1;
        data.last_updated = JsDate::now();

        self.cache.insert(site_id.to_string(), data).await;
    }

    pub async fn check_bandwidth_exceeded(
        &self,
        site_id: &str,
        site: &GetCurrentSiteResponse,
        site_type: SiteType,
    ) -> Result<(), ApiError> {
        let data = self.get_with_usage(site_id, site, site_type).await;

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

    pub async fn reset_cache(
        &self,
        usage: &SiteUsageEntity,
        site: &SiteEntity,
        site_type: SiteType,
    ) {
        if let Ok(site_value) = site_to_value(site) {
            let data = SiteUsageData {
                site_size: site.calculate_site_size(),
                request_count: usage.request_count as u64,
                request_error_count: usage.request_error_count as u64,
                total_bandwidth: usage.total_bandwidth as u64,
                last_updated: JsDate::now(),
                bandwidth_allowance: site_type.get_bandwidth_allowance(self.exec_env),
                site_data: serde_json::to_value(site_value).unwrap_or(json!({})),
            };
            self.cache.insert(usage.site_id.clone(), data).await;
        }
    }

    // SiteDomain
    pub async fn insert_domain_mapping(&self, site_id: &str, domain: &str) {
        self.domain_cache
            .insert(domain.to_string(), site_id.to_string())
            .await;
    }

    pub async fn remove_domain_mapping(&self, site_id: &str) {
        for (domain, mapped_site_id) in self.domain_cache.iter() {
            if mapped_site_id == site_id {
                self.domain_cache.remove(domain.as_str()).await;
            }
        }
    }

    pub async fn get_site_id_by_domain(&self, domain: &str) -> Option<String> {
        self.domain_cache.get(domain).await
    }

    pub async fn update_site_domains(&self, site_id: &str, domains: &Vec<String>) {
        self.remove_domain_mapping(site_id).await;

        for domain in domains {
            self.domain_cache
                .insert(domain.to_string(), site_id.to_string())
                .await;
        }
    }

    // SiteMetadata
    pub async fn create_or_update_metadata(&self, site_id: &str, metadata: SiteMetadata) {
        self.metadata_cache
            .insert(site_id.to_string(), metadata)
            .await;
    }

    pub async fn get_metadata(&self, site_id: &str) -> Option<SiteMetadata> {
        self.metadata_cache.get(site_id).await
    }

    pub async fn get_metadata_with(
        &self,
        site_id: &str,
        init: impl Future<Output = Result<SiteMetadata, ApiError>>,
    ) -> Result<SiteMetadata, ApiError> {
        self.metadata_cache
            .try_get_with(site_id.to_string(), init)
            .await
            .map_err(|e| Borrow::<ApiError>::borrow(&e).clone())
    }

    pub async fn remove_metadata(&self, site_id: &str) {
        self.metadata_cache.invalidate(site_id).await;
    }
}
