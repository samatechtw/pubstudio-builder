use chrono::{DateTime, Utc};
use lib_shared_types::{
    entity::site_api::custom_domain_entity::CustomDomainRelationEntity,
    platform::site_checkout_state::SiteCheckoutState,
    shared::site::{SitePaymentPeriod, SiteType},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct SiteServerRelationEntity {
    pub id: Uuid,
    pub address: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SiteCheckoutRelationEntity {
    pub id: Uuid,
    pub state: SiteCheckoutState,
    pub payment_period: SitePaymentPeriod,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PlatformSiteEntity {
    pub id: Uuid,
    pub name: String,
    pub site_server_id: Uuid,
    pub owner_id: Uuid,
    #[serde(rename = "type")]
    pub site_type: SiteType,
    pub published: bool,
    pub disabled: bool,
    pub subdomain: String,
    pub subdomain_record_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetPlatformSiteEntity {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,
    #[serde(rename = "type")]
    pub site_type: SiteType,
    pub published: bool,
    pub disabled: bool,
    pub subdomain: String,
    pub subdomain_record_id: String,
    pub custom_domains: Vec<CustomDomainRelationEntity>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    // Relations
    pub checkout: Option<SiteCheckoutRelationEntity>,
    pub site_server: Option<SiteServerRelationEntity>,
}

#[derive(Debug)]
pub struct PlatformSiteListResults {
    pub total: i64,
    pub asset_allowance: u64,
    pub results: Vec<GetPlatformSiteEntity>,
}
