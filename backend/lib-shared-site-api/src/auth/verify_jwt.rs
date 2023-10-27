use std::str::FromStr;

use base64::{engine::general_purpose, Engine as _};
use jsonwebtoken::{Algorithm, DecodingKey, Validation};
use lib_shared_types::{error::api_error::ApiErrorCode, shared::user::UserType};
use uuid::Uuid;

use crate::error::api_error::ApiError;

use super::types::{ConfirmClaims, JwtClaims, UserToken};

fn unauthorized() -> ApiError {
    return ApiError::unauthorized().code(ApiErrorCode::InvalidAuth);
}

pub fn verify_jwt(public_key: String, token: &str) -> Result<UserToken, ApiError> {
    let bytes_public_key = general_purpose::STANDARD
        .decode(public_key.clone())
        .map_err(|_| ApiError::internal_error().message("Decode error1"))?;
    let decoded_public_key = String::from_utf8(bytes_public_key)
        .map_err(|_| ApiError::internal_error().message("Decode error2"))?;

    let validation = Validation::new(Algorithm::RS256);

    let decoded = jsonwebtoken::decode::<JwtClaims>(
        token,
        &jsonwebtoken::DecodingKey::from_rsa_pem(decoded_public_key.as_bytes()).map_err(|e| {
            ApiError::internal_error().message(format!("JWT decode error: {}", e.to_string()))
        })?,
        &validation,
    )
    .map_err(|_| unauthorized())?;

    let user_type = UserType::from_str(&decoded.claims.user_type).map_err(|_| unauthorized())?;

    let user_id = Uuid::parse_str(&decoded.claims.sub).map_err(|_| unauthorized())?;

    Ok(UserToken {
        token: None,
        user_id,
        user_type,
        expires_in: None,
    })
}

pub fn verify_confirm_token(secret: String, token: &str) -> Result<Uuid, ApiError> {
    let key = &DecodingKey::from_secret(secret.as_ref());
    let decoded = jsonwebtoken::decode::<ConfirmClaims>(&token, key, &Validation::default())
        .map_err(|e| {
            let e_str = e.to_string();
            let mut err = ApiError::bad_request();
            if e_str == "ExpiredSignature" {
                err = err.code(ApiErrorCode::ConfirmExpired)
            }
            err.message(format!("Confirm token decode error: {}", e.to_string()))
        })?;

    let user_id = Uuid::parse_str(&decoded.claims.sub).map_err(|_| unauthorized())?;

    Ok(user_id)
}
