use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::entity::site_api::site_entity::SiteEntity;

use crate::api_context::ApiContext;

pub async fn get_site_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<SiteEntity, ApiError> {
    match context.cache.get_usage(site_id).await {
        Ok(usage) => {
            let cache: Result<SiteEntity, serde_json::Error> =
                serde_json::from_value(usage.site_data);

            match cache {
                Ok(site) => return Ok(site),
                Err(_) => (),
            }
        }
        Err(_) => (),
    };

    context
        .site_repo
        .get_site_latest_version(site_id, true)
        .await
        .map_err(|e| ApiError::not_found().message(e))
}
