use serde::{Deserialize, Serialize};

use crate::shared::site::SiteType;

use super::create_site_dto::CreateSiteDto;

#[derive(Deserialize, Serialize)]
pub struct CreateSiteMetadataDto {
    pub site_id: String,
    pub owner_id: String,
    pub owner_email: String,
    pub domains: Vec<String>,
    pub site_type: SiteType,
}

pub fn to_metadata_dto(dto: &CreateSiteDto) -> CreateSiteMetadataDto {
    CreateSiteMetadataDto {
        site_id: dto.id.clone(),
        owner_id: dto.owner_id.clone(),
        owner_email: dto.owner_email.clone(),
        domains: dto.domains.clone(),
        site_type: dto.site_type,
    }
}
