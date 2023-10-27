use axum::{
    extract::{Query, State},
    http::StatusCode,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::validate_domain_query::ValidateDomainQuery;

use crate::api_context::ApiContext;

#[debug_handler]
pub async fn validate_domain(
    Query(query): Query<ValidateDomainQuery>,
    State(context): State<ApiContext>,
) -> Result<StatusCode, ApiError> {
    let _ = context
        .metadata_repo
        .get_site_id_by_hostname(&query.domain)
        .await
        .map_err(|_| ApiError::not_found())?;

    Ok(StatusCode::OK)
}
