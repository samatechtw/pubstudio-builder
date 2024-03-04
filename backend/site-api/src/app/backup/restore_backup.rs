use std::fs;

use axum::{
    extract::{Path, State},
    Extension,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::shared::{core::ExecEnv, user::RequestUser};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

use super::{backup_sites::backup_site, helpers::check_s3_config};

pub async fn restore_backup_helper(
    context: &ApiContext,
    site_id: &str,
    backup_url: &str,
) -> Result<(), ApiError> {
    // Get the backup file from R2
    let backup_data = match context.config.exec_env {
        ExecEnv::Prod | ExecEnv::Stg => context.s3_client.get_backup(backup_url).await?,
        _ => {
            // In dev and ci environments, use a pre-set backup for testing
            let backup_file_path = "db/sites/backups/backup_test_dev_ci.db";
            fs::read(backup_file_path).map_err(|e| ApiError::internal_error().message(e))?
        }
    };

    // Import backup
    context
        .site_repo
        .import_backup(site_id, backup_data)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}

pub async fn restore_backup(
    Path((site_id, backup_id)): Path<(String, String)>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<(), ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;
    check_s3_config(&context.config)?;

    let backup_id_int = backup_id
        .parse::<u32>()
        .map_err(|_| ApiError::bad_request().message("Failed to parse backup ID"))?;

    // Get site backup to be restored
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

    // Run the backup procedure to save the current site
    let site = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    let _ = backup_site(&context, site).await;

    restore_backup_helper(&context, &site_id, &backup.url).await?;

    Ok(())
}
