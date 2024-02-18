use axum::{http::Request, RequestPartsExt};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};

use crate::error::api_error::ApiError;

pub async fn extract_bearer<B>(
    request: Request<B>,
) -> Result<(Authorization<Bearer>, Request<B>), ApiError> {
    // Manually extract so we can return a custom error if the header is missing
    let (mut parts, body) = request.into_parts();
    let auth: TypedHeader<Authorization<Bearer>> = parts
        .extract()
        .await
        .map_err(|_| ApiError::unauthorized())?;
    let request = Request::from_parts(parts, body);
    Ok((auth.0, request))
}

/// Extract the bearer token, or return the request if it's not available
pub async fn extract_bearer_optional<B>(
    request: Request<B>,
) -> (Option<Authorization<Bearer>>, Request<B>) {
    // Manually extract so we can return a custom error if the header is missing
    let (mut parts, body) = request.into_parts();
    let auth_or_err: Result<TypedHeader<Authorization<Bearer>>, _> = parts.extract().await;

    let request = Request::from_parts(parts, body);
    if let Ok(auth) = auth_or_err {
        (Some(auth.0), request)
    } else {
        (None, request)
    }
}
