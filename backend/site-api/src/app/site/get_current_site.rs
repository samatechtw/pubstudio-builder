use axum::{
    extract::{Host, Query, State},
    Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::get_current_site_dto::{
        to_api_response, GetCurrentSiteQuery, GetCurrentSiteResponse,
    },
    type_util::REGEX_PORT,
};
use lib_shared_types::{error::api_error::ApiErrorCode, type_util::is_port};

use crate::{
    api_context::ApiContext,
    db::cache_helpers::{get_metadata_from_cache_or_repo, get_site_from_cache_or_repo},
};

pub async fn get_current_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Result<Json<GetCurrentSiteResponse>, ApiError> {
    let domain_without_port = if is_port(&hostname) {
        let domain = REGEX_PORT.replace(&hostname, "");
        domain.to_string()
    } else {
        hostname
    };

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
    let metadata = get_metadata_from_cache_or_repo(&context, &site_id).await?;

    // Check if site is disabled
    if metadata.disabled {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let site = if let Some(preview_id) = query.p {
        let site = context
            .site_repo
            .get_site_by_preview_id(&site_id, &preview_id)
            .await
            .map_err(|_| ApiError::not_found().message("Site preview not found"))?;
        to_api_response(&site)
    } else {
        // Get site from cache
        let site = get_site_from_cache_or_repo(&context, &site_id).await?;

        if !site.published {
            return Err(ApiError::bad_request().code(ApiErrorCode::SiteUnpublished));
        }
        site
    };

    // Check if the bandwidth usage exceeds the allowed limit
    let site_size = site.calculate_site_size();
    context
        .cache
        .check_bandwidth_exceeded(&site_id, site_size, metadata.site_type)
        .await?;

    context
        .cache
        .increase_request_count(&site_id, site_size, metadata.site_type)
        .await;

    Ok(Json(site))
}
