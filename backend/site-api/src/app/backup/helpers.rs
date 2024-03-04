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

pub fn check_s3_config(config: &Config) -> Result<(), ApiError> {
    if config.s3_url.is_empty()
        || config.s3_secret_access_key.is_empty()
        || config.s3_access_key_id.is_empty()
    {
        return Err(ApiError::not_found().message("Missing S3 configuration"));
    }

    Ok(())
}
