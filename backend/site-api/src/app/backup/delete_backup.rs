use axum::{
    extract::{Path, State},
    Extension,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::shared::user::RequestUser;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

use super::helpers::delete_backup_from_r2;

pub async fn delete_backup(
    Path((site_id, backup_id)): Path<(String, String)>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<(), ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;

    let backup_id_int = backup_id
        .parse::<u32>()
        .map_err(|_| ApiError::bad_request().message("Failed to parse backup ID"))?;

    // Get site backup to be deleted
    let backup = context
        .backup_repo
        .get_backup(backup_id_int)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Verify the backup site_id matches the request site_id
    if backup.site_id != site_id {
        return Err(
            ApiError::bad_request().message("Backup site_id does not match the request site_id")
        );
    }

    let backup_url = backup.url;

    // Delete site backup from R2
    if delete_backup_from_r2(context.config.exec_env, &context.s3_client, &backup_url).await {
        // Delete site backup from metadata DB
        context
            .backup_repo
            .delete_backup(backup_id_int)
            .await
            .map_err(|e| ApiError::internal_error().message(e))?;
    } else {
        return Err(ApiError::bad_request().message("Failed to delete backup from R2"));
    }

    Ok(())
}
