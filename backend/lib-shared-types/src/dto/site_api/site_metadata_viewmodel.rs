use serde::Serialize;

use crate::shared::site::SiteType;

#[derive(Serialize)]
pub struct SiteMetadataViewModel {
    pub id: String,
    pub owner_email: String,
    pub owner_id: String,
    pub location: String,
    pub disabled: bool,
    pub site_type: SiteType,
    pub custom_domains: Vec<String>,
}
