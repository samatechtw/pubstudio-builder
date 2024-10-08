use serde::{Deserialize, Serialize};

use crate::{
    entity::site_api::custom_domain_entity::{vec_from_viewmodel, CustomDomainRelationEntity},
    shared::site::SiteType,
};

use super::{create_site_dto::CreateSiteDto, create_site_from_backup_dto::CreateSiteFromBackupDto};

#[derive(Deserialize, Serialize)]
pub struct CreateSiteMetadataDto {
    pub site_id: String,
    pub owner_id: String,
    pub owner_email: String,
    pub domains: Vec<CustomDomainRelationEntity>,
    pub site_type: SiteType,
}

impl From<&CreateSiteDto> for CreateSiteMetadataDto {
    fn from(value: &CreateSiteDto) -> Self {
        CreateSiteMetadataDto {
            site_id: value.id.clone(),
            owner_id: value.owner_id.clone(),
            owner_email: value.owner_email.clone(),
            domains: vec_from_viewmodel(value.domains.clone()),
            site_type: value.site_type,
        }
    }
}

impl From<&CreateSiteFromBackupDto> for CreateSiteMetadataDto {
    fn from(value: &CreateSiteFromBackupDto) -> Self {
        CreateSiteMetadataDto {
            site_id: value.site_id.clone(),
            owner_id: value.owner_id.clone(),
            owner_email: value.owner_email.clone(),
            domains: vec_from_viewmodel(value.domains.clone()),
            site_type: value.site_type,
        }
    }
}
