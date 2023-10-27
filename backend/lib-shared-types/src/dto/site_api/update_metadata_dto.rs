use serde::{Deserialize, Serialize};

use crate::shared::site::SiteType;

#[derive(Deserialize, Serialize)]
pub struct UpdateSiteMetadataDto {
    pub site_type: Option<SiteType>,
    pub disabled: Option<bool>,
    pub domains: Option<Vec<String>>,
}
