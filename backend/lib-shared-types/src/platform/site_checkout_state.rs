use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
#[serde(deny_unknown_fields)]
pub enum SiteCheckoutState {
    Active,
    Canceled,
    Verifying,
    Verified,
    Creating,
    Completed,
    Failed,
    Expired,
    SubscriptionCanceled,
}
