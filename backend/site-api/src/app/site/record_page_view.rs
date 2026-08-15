use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use axum_extra::extract::Host;
use axum_macros::debug_handler;
use lib_shared_site_api::{error::api_error::ApiError, util::json_extractor::PsJson};
use lib_shared_types::{
    dto::site_api::record_page_view_dto::{RecordPageViewDto, RecordPageViewResponse},
    error::api_error::ApiErrorCode,
};

use crate::{
    api_context::ApiContext,
    db::db_cache_layer::{get_pages_from_cache_or_repo, get_site_id_by_host_or_origin},
};

#[debug_handler]
pub async fn record_page_view(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Host(hostname): Host,
    headers: HeaderMap,
    PsJson(dto): PsJson<RecordPageViewDto>,
) -> Result<Json<RecordPageViewResponse>, ApiError> {
    let site_id = get_site_id_by_host_or_origin(&context, hostname, &headers).await?;
    if id != site_id {
        return Err(ApiError::bad_request().code(ApiErrorCode::InvalidFormData));
    }
    let page_routes = get_pages_from_cache_or_repo(&context, &site_id).await?;

    if !page_routes.contains(&dto.route) {
        return Err(ApiError::bad_request().code(ApiErrorCode::InvalidRoute));
    }

    let page_views = context
        .cache
        .increase_page_view_count(&site_id, dto.route)
        .await?;

    return Ok(Json(RecordPageViewResponse {
        view_count: page_views,
    }));
}
