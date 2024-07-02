use lib_shared_site_api::cache::cache_helpers::{
    get_site_defaults, get_site_description, get_site_title,
};
use lib_shared_site_api::{cache::cache::SiteMetadata, error::api_error::ApiError};
use lib_shared_types::cache::site_data::{CachedSiteData, CachedSiteHead};
use lib_shared_types::dto::site_api::get_current_site_dto::GetCurrentSiteResponse;
use lib_shared_types::entity::site_api::site_entity::SiteEntity;
use lib_shared_types::{
    dto::site_api::get_current_site_dto::to_api_response, error::api_error::ApiErrorCode,
};
use serde_json::{Map, Value};

use crate::api_context::ApiContext;

pub fn site_response_to_cached(site: GetCurrentSiteResponse) -> CachedSiteData {
    let defaults = get_site_defaults(&site);
    let meta = CachedSiteHead {
        title: get_site_title(&defaults, &site.name),
        description: get_site_description(&defaults, &site.name),
    };
    CachedSiteData { site, meta }
}

pub fn site_to_value(site: &SiteEntity, site_id: &str) -> Result<Value, serde_json::Error> {
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
    let response = GetCurrentSiteResponse {
        id: site_id.to_string(),
        name: site.name.clone(),
        version: site.version.clone(),
        context: site.context.clone(),
        defaults: site.defaults.clone(),
        pages: filtered_pages,
        published: site.published,
    };
    let cached_site = site_response_to_cached(response);
    Ok(serde_json::to_value(cached_site)?)
}

pub async fn get_raw_site_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<Value, ApiError> {
    let site_value = context
        .cache
        .get_site_with(site_id, async move {
            let site = context
                .site_repo
                .get_site_latest_version(site_id, true)
                .await
                .map_err(|e| ApiError::not_found().message(e))?;
            Ok(site_to_value(&site, site_id).map_err(|e| ApiError::internal_error().message(e))?)
        })
        .await?;

    Ok(site_value)
}

pub async fn get_site_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<CachedSiteData, ApiError> {
    let site_value = get_raw_site_from_cache_or_repo(context, site_id).await?;

    Ok(serde_json::from_value(site_value).map_err(|e| ApiError::internal_error().message(e))?)
}

pub async fn get_site_or_preview(
    context: &ApiContext,
    site_id: &str,
    preview: Option<String>,
) -> Result<CachedSiteData, ApiError> {
    Ok(if let Some(preview_id) = preview {
        let site = context
            .site_repo
            .get_site_by_preview_id(site_id, &preview_id)
            .await
            .map_err(|_| ApiError::not_found().message("Site preview not found"))?;
        site_response_to_cached(to_api_response(&site, site_id))
    } else {
        // Get site from cache
        let site_data: CachedSiteData = get_site_from_cache_or_repo(&context, site_id).await?;

        if !site_data.site.published {
            return Err(ApiError::bad_request().code(ApiErrorCode::SiteUnpublished));
        }
        site_data
    })
}

pub async fn get_metadata_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<SiteMetadata, ApiError> {
    context
        .cache
        .get_metadata_with(site_id, async move {
            let meta = context
                .metadata_repo
                .get_site_metadata(&site_id)
                .await
                .map_err(|e| ApiError::not_found().message(e))?;

            Ok(SiteMetadata {
                owner_id: meta.owner_id,
                site_type: meta.site_type,
                disabled: meta.disabled,
            })
        })
        .await
}

pub async fn get_site_id_by_domain_from_cache_or_repo(
    context: &ApiContext,
    domain: String,
) -> Result<String, ApiError> {
    Ok(match context.cache.get_site_id_by_domain(&domain).await {
        Some(site_id) => site_id,
        None => context
            .metadata_repo
            .get_site_id_by_hostname(&domain)
            .await
            .map_err(|_| ApiError::bad_request().message("Error fetching site ID by hostname"))?,
    })
}
