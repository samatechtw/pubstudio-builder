use axum::extract::{Path, State};
use lib_shared_site_api::{db::db_error::DbError, error::api_error::ApiError};

use crate::{api_context::ApiContext, app::backup::backup_sites::backup_site};

pub async fn delete_site(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
) -> Result<(), ApiError> {
    // Run the backup procedure before deleting the site
    let site = context
        .metadata_repo
        .get_site_metadata(&id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    let _ = backup_site(&context, site).await;

    // Remove row in sites_metadata.db
    context.metadata_repo.delete_site(&id).await.map_err(|e| {
        ApiError::internal_error().message(format!("Remove site in metadata db failed: {}", e))
    })?;

    // Clean up (delete) database files
    context
        .site_repo
        .delete_site(&id)
        .await
        .map_err(|e| match e {
            DbError::NoDb(_) => ApiError::not_found(),
            _ => ApiError::internal_error().message(format!("Clean up db failed: {}", e)),
        })?;

    // Remove cache
    context.cache.remove_domain_mapping(&id).await;
    context.cache.remove_metadata(&id).await;

    Ok(())
}
