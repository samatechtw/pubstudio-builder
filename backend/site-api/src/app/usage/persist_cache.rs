use axum::extract::State;
use lib_shared_site_api::error::api_error::ApiError;

use crate::api_context::ApiContext;

use super::helpers::persist_cache_helper;

pub async fn persist_cache(State(context): State<ApiContext>) -> Result<(), ApiError> {
    persist_cache_helper(context).await;
    Ok(())
}
