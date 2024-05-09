use axum::extract::State;
use lib_shared_site_api::error::api_error::ApiError;

use crate::api_context::ApiContext;

use super::helpers::persist_usage_helper;

pub async fn persist_usage(State(context): State<ApiContext>) -> Result<(), ApiError> {
    persist_usage_helper(context).await;
    Ok(())
}
