use lib_shared_site_api::{cache::cache::SiteMetadata, error::api_error::ApiError};
use lib_shared_types::dto::site_api::get_current_site_dto::{
    to_api_response, GetCurrentSiteResponse,
};

use crate::api_context::ApiContext;

pub async fn get_site_from_cache_or_repo(
    context: &ApiContext,
    site_id: &str,
) -> Result<GetCurrentSiteResponse, ApiError> {
    match context.cache.get_usage(site_id).await {
        Ok(usage) => {
            let cache: Result<GetCurrentSiteResponse, serde_json::Error> =
                serde_json::from_value(usage.site_data);

            match cache {
                Ok(site) => return Ok(site),
                Err(_) => (),
            }
        }
        Err(_) => (),
    };

    let site = context
        .site_repo
        .get_site_latest_version(site_id, true)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;
    Ok(to_api_response(&site, site.pages.clone()))
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
    /*
    if let Some(data) = context.cache.get_metadata(&site_id).await {
        Ok(data)
    } else {
        let meta = context
            .metadata_repo
            .get_site_metadata(&site_id)
            .await
            .map_err(|e| ApiError::not_found().message(e))?;

        let metadata = SiteMetadata {
            owner_id: meta.owner_id,
            site_type: meta.site_type,
            disabled: meta.disabled,
        };
        context
            .cache
            .create_or_update_metadata(site_id, metadata.clone())
            .await;
        Ok(metadata)
    }
         */
}
