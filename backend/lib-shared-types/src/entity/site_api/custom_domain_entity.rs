use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::dto::site_api::site_metadata_viewmodel::CustomDomainViewModel;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CustomDomainEntity {
    pub id: String,
    pub domain: String,
    pub verified: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CustomDomainRelationEntity {
    pub domain: String,
    pub verified: bool,
}

pub fn vec_from_viewmodel(domains: Vec<CustomDomainViewModel>) -> Vec<CustomDomainRelationEntity> {
    domains
        .into_iter()
        .map(|d| CustomDomainRelationEntity {
            domain: d.domain,
            verified: d.verified,
        })
        .collect()
}
