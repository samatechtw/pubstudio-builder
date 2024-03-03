use lib_shared_site_api::{
    cache::cache::{site_to_value, SiteMetadata},
    error::api_error::ApiError,
};
use lib_shared_types::dto::site_api::get_current_site_dto::GetCurrentSiteResponse;

use crate::api_context::ApiContext;

pub async fn get_site_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<GetCurrentSiteResponse, ApiError> {
    let site_value = context
        .cache
        .get_site_with(site_id, async move {
            let site = context
                .site_repo
                .get_site_latest_version(site_id, true)
                .await
                .map_err(|e| ApiError::not_found().message(e))?;
            Ok(site_to_value(&site).map_err(|e| ApiError::internal_error().message(e))?)
        })
        .await?;

    Ok(serde_json::from_value(site_value).map_err(|e| ApiError::internal_error().message(e))?)
}

pub async fn get_metadata_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<SiteMetadata, ApiError> {
    context
        .cache
        .get_metadata_with(site_id, async move {
            let meta = context
                .metadata_repo
                .get_site_metadata(&site_id)
                .await
                .map_err(|e| ApiError::not_found().message(e))?;

            Ok(SiteMetadata {
                owner_id: meta.owner_id,
                site_type: meta.site_type,
                disabled: meta.disabled,
            })
        })
        .await
}
