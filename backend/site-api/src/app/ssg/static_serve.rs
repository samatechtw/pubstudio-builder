use lib_shared_site_api::{db::db_error::DbError, error::api_error::ApiError};
use lib_shared_types::entity::site_api::static_page_entity::StaticPageEntity;
use tracing::error;

use crate::{
    api_context::ApiContext,
    db::db_cache_layer::{get_metadata_from_cache_or_repo, get_site_from_cache_or_repo},
};

// '/about/' -> '/about', '' -> '/'
pub fn normalize_route(path: &str) -> String {
    let trimmed = path.trim_end_matches('/');
    if trimmed.is_empty() {
        "/".into()
    } else {
        trimmed.into()
    }
}

// Look up an SSG page for the current published site. Returns None when the site is
// disabled/unpublished, no page was generated for the route, or the stored page is stale.
pub async fn get_fresh_static_page(
    context: &ApiContext,
    site_id: &str,
    path: &str,
) -> Result<Option<StaticPageEntity>, ApiError> {
    let metadata = get_metadata_from_cache_or_repo(context, site_id).await?;
    if metadata.disabled {
        return Ok(None);
    }
    let site = get_site_from_cache_or_repo(context, site_id).await?.site;
    if !site.published {
        return Ok(None);
    }
    let route = normalize_route(path);
    let page = match context.site_repo.get_static_page(site_id, &route).await {
        Ok(page) => page,
        // No row route is a normal miss, anything else is a real DB failure to be reported
        Err(DbError::SqlxError(sqlx::Error::RowNotFound)) | Err(DbError::EntityNotFound()) => {
            return Ok(None);
        }
        Err(e) => {
            error!(
                "static page lookup failed for site {} route {}: {}",
                site_id, route, e
            );
            return Ok(None);
        }
    };
    if page.content_updated_at != site.content_updated_at {
        return Ok(None);
    }
    Ok(Some(page))
}

pub struct ServedStaticPage {
    pub page: StaticPageEntity,
    // True when the requested route had no page and the site's /not-found
    // page was served instead (callers respond with a 404 status)
    pub not_found: bool,
}

// Resolve the static page served for a request path, with usage tracking for bandwidth
// and view count. Used by both the site-api serve path and the static_pages endpoint
// that platform-api proxies, so usage is counted no matter which server fields the request.
pub async fn serve_static_page(
    context: &ApiContext,
    site_id: &str,
    path: &str,
) -> Result<Option<ServedStaticPage>, ApiError> {
    let mut not_found = false;
    let mut page = get_fresh_static_page(context, site_id, path).await?;
    if page.is_none() {
        page = get_fresh_static_page(context, site_id, "/not-found").await?;
        not_found = true;
    }
    let Some(page) = page else {
        return Ok(None);
    };

    let metadata = get_metadata_from_cache_or_repo(context, site_id).await?;
    let size = page.body.len() as u64;
    context
        .cache
        .check_bandwidth_exceeded(site_id, size, metadata.site_type)
        .await?;
    context
        .cache
        .increase_view_count(site_id, size, metadata.site_type)
        .await;

    Ok(Some(ServedStaticPage { page, not_found }))
}
