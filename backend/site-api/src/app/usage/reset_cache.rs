use axum::extract::State;
use lib_shared_site_api::error::api_error::ApiError;
use tracing::info;

use crate::api_context::ApiContext;

pub async fn reset_cache(State(context): State<ApiContext>) -> Result<(), ApiError> {
    let result = context
        .usage_repo
        .list_latest_usages()
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    info!(result = format!("{:?}", result), "Reset cache");

    for usage in &result {
        let site_id = &usage.site_id;

        // Insert the usage_entity into the cache
        let site = context
            .site_repo
            .get_site_latest_version(site_id, true)
            .await
            .map_err(|e| ApiError::not_found().message(e))?;

        let site_metadata = context
            .metadata_repo
            .get_site_metadata(site_id)
            .await
            .map_err(|e| ApiError::not_found().message(e))?;

        context
            .cache
            .reset_usage(usage, site.calculate_site_size(), site_metadata.site_type)
            .await
    }

    Ok(())
}
