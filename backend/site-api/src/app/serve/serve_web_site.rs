use axum::{
    extract::{OriginalUri, Query, State},
    http::{header, StatusCode},
    response::{Html, IntoResponse, Response},
};
use axum_extra::extract::Host;
use lib_shared_site_api::{
    db::sites_seed_data::SITE_SEED_VERSION,
    error::api_error::ApiError,
    util::{
        domains::domain_without_port,
        get_site_html::{get_site_html, get_site_html_dev, get_site_js, get_site_js_dev},
    },
};
use lib_shared_types::{
    dto::site_api::get_current_site_dto::GetCurrentSiteQuery,
    entity::site_api::static_page_entity::StaticPageEntity, shared::core::ExecEnv,
};

use crate::{
    api_context::ApiContext,
    app::ssg::static_serve::serve_static_page,
    db::db_cache_layer::{get_site_id_by_domain_from_cache_or_repo, get_site_or_preview},
};

// Path of the shared hydration runtime referenced by generated static pages
pub const SITE_JS_PATH: &str = "/_ps/site.js";

fn static_page_response(page: StaticPageEntity, status: StatusCode) -> Response {
    (
        status,
        [(header::CONTENT_TYPE, page.content_type)],
        page.body,
    )
        .into_response()
}

fn serve_site_js(context: &ApiContext) -> Response {
    let js = if context.config.exec_env == ExecEnv::Dev {
        get_site_js_dev()
    } else {
        get_site_js().to_string()
    };
    (
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "application/javascript".to_string()),
            (
                header::CACHE_CONTROL,
                "public, max-age=31536000, immutable".to_string(),
            ),
        ],
        js,
    )
        .into_response()
}

// Serve a statically generated page when a fresh one exists for the current
// published content. Returns None to fall back to the SPA shell.
async fn try_serve_static(
    context: &ApiContext,
    site_id: &str,
    path: &str,
) -> Result<Option<Response>, ApiError> {
    let Some(served) = serve_static_page(context, site_id, path).await? else {
        return Ok(None);
    };
    let status = if served.not_found {
        StatusCode::NOT_FOUND
    } else {
        StatusCode::OK
    };
    Ok(Some(static_page_response(served.page, status)))
}

pub async fn serve_web_site_helper(
    context: &ApiContext,
    hostname: String,
    path: &str,
    query: GetCurrentSiteQuery,
) -> Result<Response, ApiError> {
    let domain = domain_without_port(hostname);

    // domain -> site_id from cache
    let site_id = get_site_id_by_domain_from_cache_or_repo(&context, domain).await?;

    // Statically generated pages take priority (previews are always dynamic)
    if query.p.is_none() {
        if let Some(response) = try_serve_static(context, &site_id, path).await? {
            return Ok(response);
        }
    }

    // TODO -- either cache  `subdomain -> server.address` or the whole HTML response

    let site = get_site_or_preview(&context, &site_id, query.p).await?;

    let html = if context.config.exec_env == ExecEnv::Dev {
        &get_site_html_dev()
    } else {
        get_site_html(&site.site.version)
    };
    Ok(
        Html(html.replacen("Pub Studio", &site.meta.title, 3).replacen(
            "DESCRIPTION",
            &site.meta.description,
            2,
        ))
        .into_response(),
    )
}

pub async fn serve_web_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
    OriginalUri(uri): OriginalUri,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Response {
    let path = uri.path();
    if path == SITE_JS_PATH {
        return serve_site_js(&context);
    }

    let result = serve_web_site_helper(&context, hostname, path, query).await;

    match result {
        Ok(response) => response,
        Err(e) => {
            tracing::warn!("serve_web_site fallback for {}: {:?}", path, e);
            Html(get_site_html(SITE_SEED_VERSION).to_string()).into_response()
        }
    }
}
