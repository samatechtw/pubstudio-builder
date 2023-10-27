use axum::{
    extract::{Path, State},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::{cache::cache::CacheSiteData, error::api_error::ApiError};
use lib_shared_types::shared::user::RequestUser;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

#[debug_handler]
pub async fn get_site_usage(
    Path(site_id): Path<String>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Result<Json<CacheSiteData>, ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;

    let data = context.cache.get_cache(&site_id).await?;

    return Ok(Json(data));
}
