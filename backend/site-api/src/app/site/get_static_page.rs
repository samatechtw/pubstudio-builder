use axum::{
    extract::{Path, Query, State},
    Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::ssg_dto::{GetStaticPageQuery, StaticPageViewModel};

use crate::{api_context::ApiContext, app::ssg::static_serve::serve_static_page};

// Returns the SSG page served for a request path (unknown routes fall back to the site's
// /not-found page, signaled by `route`), or 404 when the site has no fresh static pages.
// Usage tracking is applied here since the page is served to a visitor by the caller.
pub async fn get_static_page(
    Path(site_id): Path<String>,
    Query(query): Query<GetStaticPageQuery>,
    State(context): State<ApiContext>,
) -> Result<Json<StaticPageViewModel>, ApiError> {
    let served = serve_static_page(&context, &site_id, &query.path)
        .await?
        .ok_or_else(|| ApiError::not_found().message("No static page for route"))?;
    Ok(Json(StaticPageViewModel {
        route: served.page.route,
        body: served.page.body,
        content_type: served.page.content_type,
    }))
}
