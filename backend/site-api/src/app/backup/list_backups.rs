use axum::{
    extract::{Path, State},
    Extension, Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{entity::site_api::backup_entity::BackupEntity, shared::user::RequestUser};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn list_backups(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<Json<Vec<BackupEntity>>, ApiError> {
    verify_site_owner(&context, &user, &id).await?;

    let result = context
        .backup_repo
        .list_backups_by_site_id(&id)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(Json(result))
}
