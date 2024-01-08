use serde::{Deserialize, Serialize};

use crate::shared::site::SiteType;

#[derive(Deserialize, Serialize, Clone)]
pub struct SiteMetadataEntity {
    pub id: String,
    pub location: String,
    pub owner_id: String,
    pub domains: Vec<String>,
    pub site_type: SiteType,
    pub disabled: bool,
}
