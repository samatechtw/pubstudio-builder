use serde::{Deserialize, Serialize};

use crate::shared::site::SiteType;

#[derive(Deserialize, Serialize, Clone)]
pub struct UpdateSiteMetadataDto {
    pub site_type: Option<SiteType>,
    pub disabled: Option<bool>,
    pub domains: Option<Vec<String>>,
    pub owner_email: Option<String>,
    pub owner_id: Option<String>,
}
