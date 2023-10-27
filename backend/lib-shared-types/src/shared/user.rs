use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;
use strum::{Display, EnumString};

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum UserStatus {
    Active,
    Blocked,
    Removed,
}

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum UserType {
    Admin,
    Owner,
    Anonymous,
    Cron,
}

#[derive(Clone)]
pub struct RequestUser {
    pub user_type: UserType,
    pub user_id: Option<Uuid>,
}
