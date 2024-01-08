use axum::{extract::State, Json};
use lib_shared_site_api::error::api_error::ApiError;

use crate::api_context::ApiContext;

use super::backup_sites::{backup_all_sites, BackupSitesResult};

pub async fn backup_all(
    State(context): State<ApiContext>,
) -> Result<Json<BackupSitesResult>, ApiError> {
    let result = backup_all_sites(context).await;

    Ok(Json(result))
}
