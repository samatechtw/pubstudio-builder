use axum::{
    extract::{Query, State},
    Json,
};
use axum_extra::extract::Host;
use lib_shared_site_api::{error::api_error::ApiError, util::domains::domain_without_port};
use lib_shared_types::dto::site_api::get_current_site_dto::{
    GetCurrentSiteQuery, GetCurrentSiteResponse,
};
use lib_shared_types::error::api_error::ApiErrorCode;

use crate::{
    api_context::ApiContext,
    db::db_cache_layer::{
        get_metadata_from_cache_or_repo, get_site_id_by_domain_from_cache_or_repo,
        get_site_or_preview,
    },
};

pub async fn get_current_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Result<Json<GetCurrentSiteResponse>, ApiError> {
    let domain = domain_without_port(hostname);

    // domain -> site_id from cache
    let site_id = get_site_id_by_domain_from_cache_or_repo(&context, domain).await?;

    // Get metadata from cache
    let metadata = get_metadata_from_cache_or_repo(&context, &site_id).await?;

    // Check if site is disabled
    if metadata.disabled {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let site = get_site_or_preview(&context, &site_id, query.p).await?.site;

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
