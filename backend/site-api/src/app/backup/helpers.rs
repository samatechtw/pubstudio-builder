use std::fs;

use lib_shared_site_api::{clients::s3_client::S3Client, error::api_error::ApiError};
use lib_shared_types::shared::core::ExecEnv;
use tracing::error;

use crate::config::Config;

pub async fn delete_backup_from_r2(env: ExecEnv, s3_client: &S3Client, backup_url: &str) -> bool {
    if env == ExecEnv::Ci || env == ExecEnv::Dev {
        return true;
    }

    match s3_client.delete_backup(backup_url).await {
        Ok(_) => true,
        Err(e) => {
            error!(
                "Failed to delete s3 backup: {}, {}",
                backup_url,
                e.to_string()
            );
            false
        }
    }
}

pub async fn get_backup_from_r2(
    env: ExecEnv,
    s3_client: &S3Client,
    backup_url: &str,
) -> Result<Vec<u8>, ApiError> {
    // Get the backup file from R2
    if env == ExecEnv::Ci || env == ExecEnv::Dev {
        // In dev and ci environments, use a pre-set backup for testing
        let backup_file_path = "db/sites/backups/backup_test_dev_ci.db";
        return fs::read(backup_file_path).map_err(|e| ApiError::internal_error().message(e));
    }
    s3_client.get_backup(backup_url).await
}

pub fn check_s3_config(config: &Config) -> Result<(), ApiError> {
    if config.s3_url.is_empty()
        || config.s3_secret_access_key.is_empty()
        || config.s3_access_key_id.is_empty()
    {
        return Err(ApiError::not_found().message("Missing S3 configuration"));
    }

    Ok(())
}
