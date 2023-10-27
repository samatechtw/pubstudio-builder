use lib_shared_site_api::clients::s3_client::S3Client;
use lib_shared_types::shared::core::ExecEnv;
use tracing::error;

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
