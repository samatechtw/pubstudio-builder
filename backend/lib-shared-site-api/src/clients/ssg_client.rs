use std::time::Duration;

use lib_shared_types::dto::site_api::ssg_dto::{SsgGenerateRequest, SsgGenerateResponse};

use crate::{error::api_error::ApiError, reqwest};

// Client for the SSG service (apps/ssg), which prerenders a published site
// to static pages. Called by site-api at publish time.
pub async fn ssg_generate(
    ssg_url: &str,
    request: &SsgGenerateRequest,
) -> Result<SsgGenerateResponse, ApiError> {
    let url = format!("{}/api/generate", ssg_url.trim_end_matches('/'));
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| ApiError::internal_error().message(e.to_string()))?;

    let response =
        client.post(&url).json(request).send().await.map_err(|e| {
            ApiError::internal_error().message(format!("SSG request failed: {}", e))
        })?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::internal_error()
            .message(format!("SSG generation failed ({}): {}", status, body)));
    }
    response
        .json::<SsgGenerateResponse>()
        .await
        .map_err(|e| ApiError::internal_error().message(format!("Invalid SSG response: {}", e)))
}
