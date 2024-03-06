use axum::{
    extract::{Path, State},
    Extension,
};
use lib_shared_site_api::{db::db_error::DbError, error::api_error::ApiError};
use lib_shared_types::shared::user::RequestUser;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

use super::create_draft::list_versions;

pub async fn delete_draft(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<(), ApiError> {
    verify_site_owner(&context, &user, &id).await?;

    let versions = list_versions(&context, &id).await?;

    let no_draft = versions.len() == 1 || versions.get(0).is_some_and(|v| v.published);

    if no_draft {
        return Err(ApiError::bad_request().message("Site is missing draft"));
    } else {
        context
            .site_repo
            .delete_draft(&id)
            .await
            .map_err(|e| match e {
                DbError::NoDb(_) => ApiError::not_found(),
                _ => ApiError::internal_error().message(e),
            })?;
    }

    Ok(())
}
