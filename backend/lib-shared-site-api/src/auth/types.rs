use lib_shared_types::shared::user::UserType;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserToken {
    pub token: Option<String>,
    pub user_type: UserType,
    pub user_id: Uuid,
    pub expires_in: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: String,
    pub user_type: String,
    pub exp: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfirmClaims {
    pub sub: String,
    pub exp: i64,
}
