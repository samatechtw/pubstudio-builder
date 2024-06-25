use axum::{
    extract::{Path, Query, State},
    Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    cache::site_data::CachedSiteHead, dto::site_api::get_current_site_dto::GetCurrentSiteQuery,
};

use crate::{api_context::ApiContext, db::db_cache_layer::get_site_or_preview};

#[debug_handler]
pub async fn get_site_head(
    Path(site_id): Path<String>,
    State(context): State<ApiContext>,
    Query(query): Query<GetCurrentSiteQuery>,
) -> Result<Json<CachedSiteHead>, ApiError> {
    let cached_site = get_site_or_preview(&context, &site_id, query.p).await?;

    Ok(Json(cached_site.meta))
}
