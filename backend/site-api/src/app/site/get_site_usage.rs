use axum::{
    extract::{Path, State},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::site_usage_viewmodel::SiteUsageViewModel, shared::user::RequestUser,
};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

#[debug_handler]
pub async fn get_site_usage(
    Path(site_id): Path<String>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Result<Json<SiteUsageViewModel>, ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;
    let usage = context.cache.get_usage(&site_id).await?;

    let site_metadata = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|_| ApiError::not_found())?;

    return Ok(Json(
        usage.to_viewmodel(
            site_metadata.custom_data_usage,
            site_metadata
                .site_type
                .get_custom_data_allowance(context.config.exec_env),
        ),
    ));
}
