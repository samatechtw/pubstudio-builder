use axum::{
    extract::{Query, State},
    response::Html,
};
use axum_extra::extract::Host;
use lib_shared_site_api::{
    db::sites_seed_data::SITE_SEED_VERSION,
    error::api_error::ApiError,
    util::{domains::domain_without_port, get_site_html::get_site_html},
};
use lib_shared_types::dto::site_api::get_current_site_dto::GetCurrentSiteQuery;

use crate::{
    api_context::ApiContext,
    db::db_cache_layer::{get_site_id_by_domain_from_cache_or_repo, get_site_or_preview},
};

pub async fn serve_web_site_helper(
    context: &ApiContext,
    hostname: String,
    query: GetCurrentSiteQuery,
) -> Result<Html<String>, ApiError> {
    let domain = domain_without_port(hostname);

    // domain -> site_id from cache
    let site_id = get_site_id_by_domain_from_cache_or_repo(&context, domain).await?;

    // TODO -- either cache  `subdomain -> server.address` or the whole HTML response

    let site = get_site_or_preview(&context, &site_id, query.p).await?;

    let html = get_site_html(&site.site.version);
    Ok(Html(
        html.replacen("Pub Studio", &site.meta.title, 3).replacen(
            "DESCRIPTION",
            &site.meta.description,
            2,
        ),
    ))
}

pub async fn serve_web_site(
    State(context): State<ApiContext>,
    Host(hostname): Host,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Result<Html<String>, ApiError> {
    let result: Result<Html<String>, ApiError> =
        serve_web_site_helper(&context, hostname, query).await;

    if let Err(_) = result {
        Ok(Html(get_site_html(SITE_SEED_VERSION).into()))
    } else {
        result
    }
}
