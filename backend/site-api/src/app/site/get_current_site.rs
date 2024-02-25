use axum::{
    extract::{Host, Query, State},
    Extension, Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::get_current_site_dto::GetCurrentSiteQuery,
    entity::site_api::site_entity::SiteEntity, shared::user::RequestUser, type_util::REGEX_PORT,
};
use lib_shared_types::{error::api_error::ApiErrorCode, type_util::is_port};
use serde::Serialize;

use crate::api_context::ApiContext;

use super::util::is_admin_or_site_owner;

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

    let site = if let Some(preview_id) = query.p {
        context
            .site_repo
            .get_site_by_preview_id(&site_id, &preview_id)
            .await
            .map_err(|_| ApiError::not_found().message("Site preview not found"))?
    } else {
        let site = context
            .site_repo
            .get_site_latest_version(&site_id, true)
            .await
            .map_err(|e| ApiError::not_found().message(e))?;

        if !site.published && !is_admin_or_site_owner(&site_metadata, &user) {
            return Err(ApiError::bad_request().code(ApiErrorCode::SiteUnpublished));
        }
        site
    };

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
