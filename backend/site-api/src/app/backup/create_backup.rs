use axum::extract::{Path, State};
use lib_shared_site_api::error::api_error::ApiError;

use crate::api_context::ApiContext;

use super::backup_sites::backup_site;

pub async fn create_backup(
    Path(site_id): Path<String>,
    State(context): State<ApiContext>,
) -> Result<(), ApiError> {
    let site = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    match backup_site(&context, site).await {
        Ok(_) => Ok(()),
        Err(e) => Err(ApiError::internal_error().message(format!("Failed to backup site: {}", e))),
    }
}
