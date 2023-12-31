use axum::{
    extract::{Host, State},
    Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{entity::site_api::site_entity::SiteEntity, type_util::REGEX_PORT};
use lib_shared_types::{error::api_error::ApiErrorCode, type_util::is_port};
use serde::Serialize;

use crate::api_context::ApiContext;

#[derive(Serialize)]
pub struct GetCurrentSiteResponse {
    name: String,
    version: String,
    context: String,
    defaults: String,
    pages: String,
}

fn to_api_response(site: SiteEntity) -> Json<GetCurrentSiteResponse> {
    return Json(GetCurrentSiteResponse {
        name: site.name,
        version: site.version,
        context: site.context,
        defaults: site.defaults,
        pages: site.pages,
    });
}

pub async fn get_current_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
) -> Result<Json<GetCurrentSiteResponse>, ApiError> {
    let domain_without_port = if is_port(&hostname) {
        let domain = REGEX_PORT.replace(&hostname, "");
        domain.to_string()
    } else {
        hostname
    };

    let site_id = context
        .metadata_repo
        .get_site_id_by_hostname(&domain_without_port)
        .await
        .map_err(|_| ApiError::bad_request().message("Error fetching site ID by hostname"))?;

    let site_metadata = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Check if site is disabled
    if site_metadata.disabled {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let site = context
        .site_repo
        .get_site_latest_version(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    let site_size = site.calculate_site_size();

    // Check if the bandwidth usage exceeds the allowed limit
    context
        .cache
        .check_bandwidth_exceeded(&site_id, site_size, site_metadata.site_type)
        .await?;

    context
        .cache
        .increase_request_count(&site_id, site_size, site_metadata.site_type)
        .await;

    Ok(to_api_response(site))
}
