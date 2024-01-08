use std::str::FromStr;

use base64::{engine::general_purpose, Engine};
use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header};
use lib_shared_types::shared::user::UserType;
use uuid::Uuid;

use crate::error::api_error::ApiError;

use super::types::{ConfirmClaims, JwtClaims, UserToken};

pub fn generate_admin_jwt(private_key: String) -> Result<UserToken, ApiError> {
    generate_jwt(
        Uuid::from_str("b8d4843e-4b83-4340-9104-5b225ae551d5").unwrap(),
        UserType::Admin,
        52034400,
        private_key,
    )
}

pub fn generate_jwt(
    user_id: Uuid,
    user_type: UserType,
    // TTL in minutes
    ttl: i64,
    private_key: String,
) -> Result<UserToken, ApiError> {
    let bytes_private_key = general_purpose::STANDARD
        .decode(private_key)
        .map_err(|_| ApiError::internal_error())?;
    let decoded_private_key =
        String::from_utf8(bytes_private_key).map_err(|_| ApiError::internal_error())?;

    let now = Utc::now();
    let mut token_details = UserToken {
        user_id,
        user_type,
        expires_in: Some((now + Duration::minutes(ttl)).timestamp()),
        token: None,
    };

    let claims = JwtClaims {
        sub: token_details.user_id.to_string(),
        user_type: user_type.to_string(),
        exp: token_details.expires_in.ok_or(ApiError::internal_error())?,
    };

    let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256);
    let token = jsonwebtoken::encode(
        &header,
        &claims,
        &jsonwebtoken::EncodingKey::from_rsa_pem(decoded_private_key.as_bytes())
            .map_err(|_| ApiError::internal_error())?,
    )
    .map_err(|_| ApiError::internal_error())?;
    token_details.token = Some(token);
    Ok(token_details)
}

pub fn generate_confirm_token(
    user_id: Uuid,
    // TTL in minutes
    ttl: i64,
    secret: String,
) -> Result<String, ApiError> {
    let key = &EncodingKey::from_secret(secret.as_ref());

    let claims = ConfirmClaims {
        sub: user_id.to_string(),
        exp: (Utc::now() + Duration::minutes(ttl)).timestamp(),
    };

    let token = jsonwebtoken::encode(&Header::default(), &claims, key)
        .map_err(|_| ApiError::internal_error().message("Failed to encode confirm token"))?;

    Ok(token)
}
