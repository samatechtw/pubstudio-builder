use crate::{shared::site::SiteType, type_util::REGEX_UUID};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Clone, Deserialize, Serialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateSiteFromBackupDto {
    pub backup_url: String,
    #[validate(regex(path = "*REGEX_UUID"))]
    pub site_id: String,
    #[validate(regex(path = "*REGEX_UUID"))]
    pub owner_id: String,
    #[validate(email)]
    pub owner_email: String,
    pub domains: Vec<String>,
    pub site_type: SiteType,
}
