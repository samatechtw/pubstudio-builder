use axum::{
    extract::{Host, Query, State},
    Extension, Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::get_current_site_dto::{
        to_api_response, GetCurrentSiteQuery, GetCurrentSiteResponse,
    },
    shared::user::RequestUser,
    type_util::REGEX_PORT,
};
use lib_shared_types::{error::api_error::ApiErrorCode, type_util::is_port};
use serde_json::{Map, Value};

use crate::{api_context::ApiContext, app::site::helpers::get_site_from_cache_or_repo};

use super::util::is_admin_or_site_owner;

pub async fn get_current_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
    Extension(user): Extension<RequestUser>,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Result<Json<GetCurrentSiteResponse>, ApiError> {
    let domain_without_port = if is_port(&hostname) {
        let domain = REGEX_PORT.replace(&hostname, "");
        domain.to_string()
    } else {
        hostname
    };

    println!("GET CUR {}", domain_without_port);

    // domain -> site_id from cache
    let site_id = match context
        .cache
        .get_site_id_by_domain(&domain_without_port)
        .await
    {
        Some(site_id) => site_id,
        None => context
            .metadata_repo
            .get_site_id_by_hostname(&domain_without_port)
            .await
            .map_err(|_| ApiError::bad_request().message("Error fetching site ID by hostname"))?,
    };

    // Get metadata from cache
    let (disabled, owner_id, site_type) = match context.cache.get_metadata(&site_id).await {
        Some(data) => (data.disabled, data.owner_id, data.site_type),
        None => {
            let metadata = context
                .metadata_repo
                .get_site_metadata(&site_id)
                .await
                .map_err(|e| ApiError::not_found().message(e))?;
            (metadata.disabled, metadata.owner_id, metadata.site_type)
        }
    };

    // Check if site is disabled
    if disabled {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let site = if let Some(preview_id) = query.p {
        context
            .site_repo
            .get_site_by_preview_id(&site_id, &preview_id)
            .await
            .map_err(|_| ApiError::not_found().message("Site preview not found"))?
    } else {
        // Get site from cache
        let site = get_site_from_cache_or_repo(&context, &site_id).await?;

        if !site.published && !is_admin_or_site_owner(&owner_id, &user) {
            return Err(ApiError::bad_request().code(ApiErrorCode::SiteUnpublished));
        }
        site
    };

    // Check if the bandwidth usage exceeds the allowed limit
    context
        .cache
        .check_bandwidth_exceeded(&site_id, &site, site_type)
        .await?;

    context
        .cache
        .increase_request_count(&site_id, &site, site_type)
        .await;

    // Only include public pages
    let filtered_pages = filter_pages(&site.pages)?;
    println!("Filtered Pages: {}", filtered_pages);

    Ok(Json(to_api_response(&site, filtered_pages)))
}

fn filter_pages(pages: &str) -> Result<String, ApiError> {
    let cleaned_pages = pages.trim().trim_matches('"').replace("\\", "");

    println!("Cleaned pages: {}", cleaned_pages);

    let mut pages: Map<String, Value> = serde_json::from_str(&cleaned_pages)
        .map_err(|_| ApiError::internal_error().message("Failed to parse pages"))?;

    let mut filtered_json = Map::new();
    for (key, value) in pages.iter_mut() {
        if let Some(public) = value.get("public").and_then(Value::as_bool) {
            if public {
                filtered_json.insert(key.clone(), value.clone());
            }
        }
    }

    serde_json::to_string(&filtered_json)
        .map_err(|_| ApiError::internal_error().message("Failed to parse JSON to String"))
}
