use serde::Serialize;

use crate::entity::site_api::site_metadata_entity::SiteMetadataEntity;

#[derive(Serialize)]
pub struct GetSiteDomainsViewModel {
    pub domains: Vec<String>,
}

pub fn to_api_response(site_metadata: SiteMetadataEntity) -> GetSiteDomainsViewModel {
    return GetSiteDomainsViewModel {
        domains: site_metadata.domains,
    };
}
