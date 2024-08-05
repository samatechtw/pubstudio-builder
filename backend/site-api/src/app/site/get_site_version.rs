use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::{
    api_error::ApiError,
    helpers::{check_bad_form, validate_integer},
};
use lib_shared_types::{
    dto::site_api::{get_site_version_dto::GetSiteVersionQuery, site_viewmodel::to_api_response},
    error::api_error::ApiErrorCode,
    shared::user::{RequestUser, UserType},
};
use validator::Validate;

use crate::{
    api_context::ApiContext, db::db_cache_layer::get_metadata_from_cache_or_repo,
    middleware::auth::verify_site_owner,
};

#[debug_handler]
pub async fn get_site_version(
    Path((site_id, version_id)): Path<(String, String)>,
    Query(query): Query<GetSiteVersionQuery>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Response {
    match get_site_version_result(site_id, version_id, query, user, context).await {
        Ok(response) => response,
        Err(e) => e.into_response(),
    }
}

pub async fn get_site_version_result(
    site_id: String,
    version_id: String,
    query: GetSiteVersionQuery,
    user: RequestUser,
    context: ApiContext,
) -> Result<Response, ApiError> {
    check_bad_form(query.validate())?;
    verify_site_owner(&context, &user, &site_id).await?;

    // validate version number
    if version_id != "latest" {
        validate_integer(&version_id)?
    }
    let metadata = get_metadata_from_cache_or_repo(&context, &site_id).await?;

    // Check if site is disabled
    if metadata.disabled && user.user_type != UserType::Admin && user.user_type != UserType::Cron {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let repo = &context.site_repo;

    let site = if version_id == "latest" {
        repo.get_site_latest_version(&site_id, false).await
    } else {
        repo.get_site_by_version(&site_id, &version_id).await
    }
    .map_err(|e| ApiError::not_found().message(e))?;

    if let Some(update_key) = query.update_key {
        let content_updated = site.content_updated_at;
        return if content_updated <= update_key {
            Ok(StatusCode::NO_CONTENT.into_response())
        } else {
            Ok(Json(to_api_response(site)).into_response())
        };
    };

    Ok(Json(to_api_response(site)).into_response())
}
