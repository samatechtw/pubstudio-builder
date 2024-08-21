use serde::{Deserialize, Serialize};

use crate::{
    entity::site_api::custom_domain_entity::CustomDomainRelationEntity, shared::site::SiteType,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomDomainViewModel {
    pub domain: String,
    pub verified: bool,
}

impl From<CustomDomainRelationEntity> for CustomDomainViewModel {
    fn from(value: CustomDomainRelationEntity) -> Self {
        CustomDomainViewModel {
            domain: value.domain,
            verified: value.verified,
        }
    }
}

pub fn vec_from_entity(domains: Vec<CustomDomainRelationEntity>) -> Vec<CustomDomainViewModel> {
    domains.into_iter().map(|d| d.into()).collect()
}

#[derive(Serialize)]
pub struct SiteMetadataViewModel {
    pub id: String,
    pub owner_email: String,
    pub owner_id: String,
    pub location: String,
    pub disabled: bool,
    pub site_type: SiteType,
    pub custom_domains: Vec<CustomDomainViewModel>,
}
