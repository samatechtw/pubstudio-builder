use axum::{
    extract::{Path, State},
    Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::create_backup_dto::CreateBackupResponse;

use crate::api_context::ApiContext;

use super::{backup_sites::backup_site, helpers::check_s3_config};

pub async fn create_backup(
    Path(site_id): Path<String>,
    State(context): State<ApiContext>,
) -> Result<Json<CreateBackupResponse>, ApiError> {
    check_s3_config(&context.config)?;

    let site = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    let backup = backup_site(&context, site)
        .await
        .map_err(|e| ApiError::internal_error().message(format!("Failed to backup site: {}", e)))?;

    Ok(Json(backup.into()))
}
