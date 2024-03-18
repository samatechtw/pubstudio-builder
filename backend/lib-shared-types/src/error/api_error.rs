use std::str::FromStr;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
    pub status: u16,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ApiErrorCode {
    InvalidAuth,
    InvalidFormData,
    InvalidOldPassword,
    LocalSiteExists,
    UserExists,
    MissingSiteId,
    SiteServerAddressExists,
    SiteVerificationFail,
    NoAvailableSiteServer,
    NoUpdates,
    UpdateStale,
    SiteHasAssets,
    InvalidCollectionId,
    TemplateNameExists,
    TemplateCollectionNameExists,
    Unauthorized,
    DnsRecordCreationFailed,
    DnsRecordListFailed,
    DnsRecordUpdateFailed,
    SiteDataLenExceeded,
    SiteDisabled,
    SiteCheckoutNotActive,
    AssetUsageExceeded,
    SubscriptionCancelFailed,
    AlreadyConfirmed,
    ConfirmExpired,
    ReAuthFailed,
    SiteUnpublished,
    SubdomainReserved,
    SubdomainTaken,
    CustomTableNameExists,
    None,
}

impl std::fmt::Display for ApiErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self:?}")
    }
}

impl FromStr for ApiErrorCode {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "InvalidAuth" => ApiErrorCode::InvalidAuth,
            "InvalidFormData" => ApiErrorCode::InvalidFormData,
            "InvalidOldPassword" => ApiErrorCode::InvalidOldPassword,
            "UserExists" => ApiErrorCode::UserExists,
            "NoUpdates" => ApiErrorCode::NoUpdates,
            _ => ApiErrorCode::None,
        })
    }
}
