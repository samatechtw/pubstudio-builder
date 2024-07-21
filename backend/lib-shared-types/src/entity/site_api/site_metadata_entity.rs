use serde::{Deserialize, Serialize};

use crate::{dto::site_api::update_metadata_dto::UpdateSiteMetadataDto, shared::site::SiteType};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct SiteMetadataEntity {
    pub id: String,
    pub location: String,
    pub owner_id: String,
    pub owner_email: String,
    pub domains: Vec<String>,
    pub site_type: SiteType,
    pub disabled: bool,
    pub custom_data_usage: i64,
}

pub struct UpdateSiteMetadataEntity {
    pub site_type: Option<SiteType>,
    pub owner_email: Option<String>,
    pub owner_id: Option<String>,
    pub disabled: Option<bool>,
    pub domains: Option<Vec<String>>,
    pub custom_data_usage: Option<i64>,
}

impl UpdateSiteMetadataEntity {
    pub fn custom_data_usage(usage: i64) -> Self {
        UpdateSiteMetadataEntity {
            site_type: None,
            owner_email: None,
            owner_id: None,
            disabled: None,
            domains: None,
            custom_data_usage: Some(usage),
        }
    }
}

impl From<UpdateSiteMetadataDto> for UpdateSiteMetadataEntity {
    fn from(value: UpdateSiteMetadataDto) -> Self {
        UpdateSiteMetadataEntity {
            site_type: value.site_type,
            owner_email: value.owner_email,
            owner_id: value.owner_id,
            disabled: value.disabled,
            domains: value.domains,
            custom_data_usage: None,
        }
    }
}
