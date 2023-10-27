use axum::{
    extract::{Path, State},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::{api_error::ApiError, helpers::validate_integer};
use lib_shared_types::{
    dto::site_api::site_viewmodel::{to_api_response, SiteViewModel},
    shared::user::RequestUser,
};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

#[debug_handler]
pub async fn get_site_version(
    Path((site_id, version_id)): Path<(String, String)>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Result<Json<SiteViewModel>, ApiError> {
    // validate version number
    if version_id != "latest" {
        validate_integer(&version_id)?
    }
    let repo = &context.site_repo;

    let site = if version_id == "latest" {
        repo.get_site_latest_version(&site_id).await
    } else {
        repo.get_site_by_version(&site_id, &version_id).await
    }
    .map_err(|e| ApiError::not_found().message(e))?;

    if version_id != "latest" && !site.published {
        verify_site_owner(&context, &user, &site_id).await?;
    }

    Ok(Json(to_api_response(site)))
}
