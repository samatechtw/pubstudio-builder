use axum::extract::State;
use lib_shared_site_api::error::api_error::ApiError;

use crate::api_context::ApiContext;

use super::helpers::populate_usage_cache;

pub async fn reset_cache(State(context): State<ApiContext>) -> Result<(), ApiError> {
    populate_usage_cache(&context)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}
