use crate::api_context::ApiContext;
use axum::{extract::State, Json};
use lib_shared_site_api::error::api_error::ApiError;

use super::{
    backup_sites::{backup_all_sites, BackupSitesResult},
    helpers::check_s3_config,
};

pub async fn backup_all(
    State(context): State<ApiContext>,
) -> Result<Json<BackupSitesResult>, ApiError> {
    check_s3_config(&context.config)?;
    let result = backup_all_sites(context).await;

    Ok(Json(result))
}
