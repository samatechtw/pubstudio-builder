use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension,
};
use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
    util::json_extractor::PsJson,
};
use lib_shared_types::{
    dto::{query_dto::ListQuery, site_api::publish_site_dto::PublishSiteDto},
    shared::user::RequestUser,
};
use validator::Validate;

use crate::{
    api_context::ApiContext, db::cache_helpers::get_metadata_from_cache_or_repo,
    middleware::auth::verify_site_owner,
};

pub async fn publish_site(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<PublishSiteDto>,
) -> Result<Response, ApiError> {
    check_bad_form(dto.validate())?;
    verify_site_owner(&context, &user, &id).await?;

    let versions = context
        .site_repo
        .list_site_versions(&id, ListQuery::default())
        .await
        .map_err(|e| match e {
            DbError::NoDb(_) => ApiError::not_found(),
            _ => ApiError::internal_error().message(e),
        })?;

    if versions.len() == 1 || !dto.publish {
        context
            .site_repo
            .publish_all_versions(&id, dto.publish)
            .await
            .map_err(|e| match e {
                DbError::NoDb(_) => ApiError::not_found(),
                _ => ApiError::internal_error().message(e),
            })?;
        return Ok(StatusCode::NO_CONTENT.into_response());
    }

    let site = context
        .site_repo
        .publish_site(&id)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Update cache
    let metadata = get_metadata_from_cache_or_repo(&context, &id).await?;

    context
        .cache
        .create_or_update_usage(&id, &site, metadata.site_type)
        .await;

    Ok(StatusCode::NO_CONTENT.into_response())
}
