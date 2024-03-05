use axum::{
    extract::{Path, State},
    Extension, Json,
};
use lib_shared_site_api::{db::db_error::DbError, error::api_error::ApiError};
use lib_shared_types::{
    dto::{
        query_dto::ListQuery,
        site_api::site_info_viewmodel::{to_api_response, SiteInfoViewModel},
    },
    entity::site_api::site_info_entity::SiteInfoEntity,
    shared::user::RequestUser,
};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn list_versions(context: &ApiContext, id: &str) -> Result<Vec<SiteInfoEntity>, ApiError> {
    Ok(context
        .site_repo
        .list_site_versions(&id, ListQuery::default())
        .await
        .map_err(|e| match e {
            DbError::NoDb(_) => ApiError::not_found(),
            _ => ApiError::internal_error().message(e),
        })?)
}

pub async fn create_draft(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<Json<Vec<SiteInfoViewModel>>, ApiError> {
    verify_site_owner(&context, &user, &id).await?;

    let mut versions = list_versions(&context, &id).await?;

    let no_draft = versions.len() == 1 || versions.get(0).is_some_and(|v| v.published);

    if no_draft {
        if let Some(prev_version) = versions.get(0) {
            context
                .site_repo
                .create_draft(&id, prev_version.id)
                .await
                .map_err(|e| match e {
                    DbError::NoDb(_) => ApiError::not_found(),
                    _ => ApiError::internal_error().message(e),
                })?;
            versions = list_versions(&context, &id).await?;
        }
    }

    let view_models: Vec<SiteInfoViewModel> = versions
        .into_iter()
        .map(|version| to_api_response(version))
        .collect();

    Ok(Json(view_models))
}
