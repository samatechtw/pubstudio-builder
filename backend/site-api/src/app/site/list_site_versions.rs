use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
};
use lib_shared_types::{
    dto::{
        query_dto::ListQuery,
        site_api::site_info_viewmodel::{to_api_response, SiteInfoViewModel},
    },
    error::api_error::ApiErrorCode,
    shared::user::RequestUser,
};
use validator::Validate;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn list_site_versions(
    Path(id): Path<String>,
    Query(query): Query<ListQuery>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Result<Json<Vec<SiteInfoViewModel>>, ApiError> {
    check_bad_form(query.validate())?;
    validate_query(&query)?;
    verify_site_owner(&context, &user, &id).await?;

    let versions = context
        .site_repo
        .list_site_versions(&id, query)
        .await
        .map_err(|e| match e {
            DbError::NoDb(_) => ApiError::not_found(),
            _ => ApiError::internal_error().message(e),
        })?;

    let view_models: Vec<SiteInfoViewModel> = versions
        .into_iter()
        .map(|version| to_api_response(version))
        .collect();

    Ok(Json(view_models))
}

fn validate_query(query: &ListQuery) -> Result<(), ApiError> {
    if query.from > query.to {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message("From value must be less than or equal to To value".to_string()));
    }
    Ok(())
}
