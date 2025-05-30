use std::str::FromStr;

use chrono::{DateTime, Duration, Utc};
use lib_shared_types::{
    dto::site_api::{
        create_site_dto::CreateSiteDto, site_metadata_viewmodel::CustomDomainViewModel,
    },
    entity::site_api::custom_domain_entity::CustomDomainRelationEntity,
    shared::{core::ExecEnv, site::SiteType},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::util::domains::merge_domains;

// Distinct from `PlatformSiteEntity` since it includes `custom_domains`
#[derive(Debug, Deserialize, Serialize)]
pub struct PlatformSiteSeed {
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
    pub custom_domains: Vec<CustomDomainRelationEntity>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub const SITE_SEED_VERSION: &str = "2";
pub const SITE_SEED_DEFAULTS: &str = r##"{"head":{},"homePage":"/home"}"##;
pub const SITE_SEED_CONTEXT: &str = r##"{"namespace":"init","nextId":54,"styles":{"global-s-2":{"id":"global-s-2","name":"ContainerVerticalStyle","breakpoints":{"breakpoint-1":{"default":{"display":"flex","flex-direction":"column"}}}},"global-s-9":{"id":"global-s-9","name":"H1Style","breakpoints":{"breakpoint-1":{"default":{"color":"${color-text}","font-size":"${size-h1}","font-family":"${font-title}","margin":"0","line-height":"125%","font-weight":"600"}}}},"init-s-3":{"id":"init-s-3","name":"RootStyle","breakpoints":{"breakpoint-1":{"default":{"width":"100%","display":"flex","flex-direction":"column","background-color":"white","min-height":"100%"}}}},"global-s-3":{"id":"global-s-3","name":"FooterStyle","breakpoints":{"breakpoint-1":{"default":{"padding":"40px 0px 12px 0px","width":"100%","color":"${color-text}","display":"flex","flex-direction":"row","justify-content":"center","font-size":"14px","margin":"auto 0px 0px 0px"}}}}},"styleOrder":["init-s-3","global-s-2","global-s-9","global-s-3"],"customComponentIds":[],"customChildIds":[],"behaviors":{},"theme":{"variables":{"color-title":"#000000","size-title":"40px","size-h1":"36px","size-h2":"28px","size-h3":"22px","size-h4":"20px","size-h5":"18px","size-h6":"16px","color-text":"#222222","size-text":"16px","size-list":"1.3rem","color-link":"#0765d3","color-link-visited":"#6E00FF","color-primary":"#95b1d1","color-active":"#2343B4","color-secondary":"#1b3858","color-disabled":"#868692","color-border":"#dddfe2","color-button-hover":"#b7c8dc","color-error":"#ef4444","font-title":"Tahoma","font-text":"Georgia, sans-serif"},"fonts":{}},"breakpoints":{"breakpoint-1":{"id":"breakpoint-1","name":"Desktop (default)"},"breakpoint-2":{"id":"breakpoint-2","maxWidth":980,"name":"Tablet (large)"},"breakpoint-3":{"id":"breakpoint-3","maxWidth":760,"name":"Tablet (small)"},"breakpoint-4":{"id":"breakpoint-4","maxWidth":480,"name":"Mobile"}},"i18n":{},"activeI18n":"zh-tw","globalStyles":{}}"##;
pub const SITE_SEED_EDITOR: &str = r##"{"selectedComponentId":"init-c-8","active":"/home","componentTab":{},"mode":"selC","showComponentTree":true,"componentTreeExpandedItems":{"init-c-0":true,"init-c-1":true,"init-c-4":true,"init-c-8":true,"init-c-51":true,"init-c-53":true,"init-c-52":true},"componentTreeRenameData":{"renaming":false},"componentsHidden":{},"selectedThemeColors":[],"builderWidth":1080,"builderScale":0.81,"cssPseudoClass":"default","hotkeys":{},"prefs":{},"templatesShown":false,"componentMenuCollapses":{"dimensions":false,"styles":false,"childStyles":false}}"##;
pub const SITE_SEED_HISTORY: &str = r##"{"back":[],"forward":[]}"##;
pub const SITE_SEED_PAGES: &str = r##"{"/home":{"name":"Home","route":"/home","root":{"id":"init-c-0","name":"Root","tag":"div","children":[{"id":"init-c-1","name":"ContainerVertical","tag":"div","parentId":"init-c-0","children":[{"id":"init-c-4","name":"Header","tag":"div","parentId":"init-c-1","style":{"custom":{"breakpoint-1":{"default":{}}},"mixins":["global-s-2"]}},{"id":"init-c-8","name":"Content","tag":"div","parentId":"init-c-1","children":[{"id":"init-c-51","name":"H1","tag":"h1","content":"My Site","parentId":"init-c-8","style":{"custom":{},"mixins":["global-s-9"]}}],"style":{"custom":{"breakpoint-1":{"default":{"width":"100%","align-items":"center","max-width":"980px","padding":"80px 24px 80px 24px","flex":"1 1 auto"}}},"mixins":["global-s-2"]}},{"id":"init-c-52","name":"Footer","tag":"footer","parentId":"init-c-1","children":[{"id":"init-c-53","name":"Copyright","tag":"div","content":"© 2025 MyCompany","parentId":"init-c-52","style":{"custom":{},"mixins":[]}}],"style":{"custom":{},"mixins":["global-s-3"]}}],"style":{"custom":{"breakpoint-1":{"default":{"align-items":"center","flex":"1 1 0"}}},"mixins":["global-s-2"]}}],"style":{"custom":{"breakpoint-1":{"default":{}}},"mixins":["init-s-3"]}},"public":true,"head":{}}}"##;
pub const SITE_SEED_PAGE_ORDER: &str = r##"["/home"]"##;
pub const SITE_SEED_CONTACT_TABLE: &str = r##"{"table_name":"contact_form","columns":{"name":{"name":"name","data_type":"TEXT","validation_rules":[{"rule_type":"Unique"}]},"message":{"name":"message","data_type":"TEXT","validation_rules":[{"rule_type":"MinLength","parameter":3},{"rule_type":"MaxLength","parameter":100}]},"email":{"name":"email","data_type":"TEXT","validation_rules":[{"rule_type":"Email"}]}},"events":[{"event_type":"EmailRow","trigger":"AddRow","options":{"recipients":["user1@samatech.tw"]}}]}"##;

pub fn make_site_context(namespace: &str) -> String {
    SITE_SEED_CONTEXT.replace("__namespace__", namespace)
}

pub fn make_site_editor(namespace: &str) -> String {
    SITE_SEED_EDITOR.replace("__namespace__", namespace)
}

pub fn make_site_history(namespace: &str) -> String {
    SITE_SEED_HISTORY.replace("__namespace__", namespace)
}

pub fn make_site_pages(namespace: &str) -> String {
    SITE_SEED_PAGES.replace("__namespace__", namespace)
}

pub fn make_namespace(name: &str) -> String {
    name.to_lowercase().replace(" ", "_")
}

pub fn stringified_json(str: &str) -> String {
    let val: serde_json::Value = str.into();
    val.to_string()
}

// Prepare
pub fn sites_seed_data(exec_env: ExecEnv) -> Vec<CreateSiteDto> {
    root_seed_data()
        .into_iter()
        .map(|seed| {
            let namespace = make_namespace(&seed.name);
            CreateSiteDto {
                id: seed.id.to_string(),
                version: SITE_SEED_VERSION.into(),
                name: seed.name,
                owner_id: seed.owner_id.to_string(),
                owner_email: seed.owner_email,
                site_type: seed.site_type,
                context: make_site_context(&namespace).into(),
                defaults: SITE_SEED_DEFAULTS.into(),
                editor: make_site_editor(&namespace).into(),
                history: make_site_history(&namespace).into(),
                pages: make_site_pages(&namespace).into(),
                page_order: SITE_SEED_PAGE_ORDER.into(),
                published: seed.published,
                domains: merge_domains(
                    seed.custom_domains,
                    &seed.subdomain,
                    &format!("{}.pubstud.io", exec_env),
                )
                .iter()
                .map(|d| CustomDomainViewModel {
                    domain: d.clone(),
                    verified: false,
                })
                .collect(),
            }
        })
        .collect()
}

pub fn platform_sites_seed_data() -> Vec<PlatformSiteSeed> {
    root_seed_data()
        .into_iter()
        .map(|seed| PlatformSiteSeed {
            id: seed.id,
            name: seed.name,
            site_server_id: seed.site_server_id,
            owner_id: seed.owner_id,
            site_type: seed.site_type,
            published: seed.published,
            disabled: seed.disabled,
            subdomain_record_id: seed.subdomain_record_id,
            subdomain: seed.subdomain,
            custom_domains: seed
                .custom_domains
                .into_iter()
                .map(|d| CustomDomainRelationEntity {
                    domain: d,
                    verified: false,
                })
                .collect(),
            created_at: seed.created_at,
            updated_at: seed.updated_at,
        })
        .collect()
}

// Data to be transformed into seeds for either platform or site-api
pub struct RootSiteEntity {
    pub id: Uuid,
    pub name: String,
    pub site_server_id: Uuid,
    pub owner_id: Uuid,
    pub owner_email: String,
    pub site_type: SiteType,
    pub published: bool,
    pub disabled: bool,
    pub subdomain: String,
    pub subdomain_record_id: String,
    pub custom_domains: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

fn root_seed_data() -> Vec<RootSiteEntity> {
    vec![
        RootSiteEntity {
            id: Uuid::from_str("2af5f0a4-c273-42ff-b5bc-847332cbb29f").unwrap(),
            name: "Test Site 1".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_email: "admin1@samatech.tw".into(),
            owner_id: Uuid::from_str("b8d4843e-4b83-4340-9104-5b225ae551d5").unwrap(),
            site_type: SiteType::Paid1,
            published: false,
            disabled: false,
            subdomain_record_id: "my-record-id".into(),
            subdomain: "my-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        },
        RootSiteEntity {
            id: Uuid::from_str("6d2c8359-6094-402c-bcbb-37202fd7c336").unwrap(),
            name: "Test Site 2".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            owner_email: "user1@samatech.tw".into(),
            site_type: SiteType::Free,
            published: false,
            disabled: false,
            subdomain_record_id: "user1-site2-record-id".into(),
            subdomain: "user1-site2-subdomain".into(),
            custom_domains: vec!["www.myblog.org".into(), "user1-site2.localhost".into()],
            created_at: Utc::now() + Duration::days(1),
            updated_at: Utc::now(),
        },
        RootSiteEntity {
            id: Uuid::from_str("870aafc9-36e9-476a-b38c-c1aaaad9d9fe").unwrap(),
            name: "Test Site 3".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            owner_email: "user1@samatech.tw".into(),
            site_type: SiteType::Paid2,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site3-record-id".into(),
            subdomain: "user1-site3-subdomain".into(),
            custom_domains: vec!["test3.localhost".into()],
            created_at: Utc::now() + Duration::days(2),
            updated_at: Utc::now(),
        },
        RootSiteEntity {
            id: Uuid::from_str("d58080e9-dea0-434b-abda-c314b2001b23").unwrap(),
            name: "Test Site 4".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("3ba201ff-a8d8-42bb-84ef-8470e6d97f78").unwrap(),
            owner_email: "user3@samatech.tw".into(),
            site_type: SiteType::Paid3,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site4-record-id".into(),
            subdomain: "user1-site4-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(59),
            updated_at: Utc::now() - Duration::days(59),
        },
        RootSiteEntity {
            id: Uuid::from_str("8b088c7f-1605-40ea-96e9-430b4c2863fd").unwrap(),
            name: "Test Site 5".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            owner_email: "user1@samatech.tw".into(),
            site_type: SiteType::Paid1,
            published: true,
            disabled: true,
            subdomain_record_id: "user1-site5-record-id".into(),
            subdomain: "user1-site5-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(60),
            updated_at: Utc::now() - Duration::days(60),
        },
        RootSiteEntity {
            id: Uuid::from_str("4c5f525b-60a3-4908-80dd-3d44bfa3d577").unwrap(),
            name: "Test Site 6".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            owner_email: "user1@samatech.tw".into(),
            site_type: SiteType::Paid1,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site6-record-id".into(),
            subdomain: "user1-site6-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(61),
            updated_at: Utc::now() - Duration::days(61),
        },
        RootSiteEntity {
            id: Uuid::from_str("ad01f2e0-0f4b-4c86-a8af-800d5cc4f812").unwrap(),
            name: "Test Site 7".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            owner_email: "user1@samatech.tw".into(),
            site_type: SiteType::Paid1,
            published: false,
            disabled: false,
            subdomain_record_id: "user1-site7-record-id".into(),
            subdomain: "user1-site7-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(60),
            updated_at: Utc::now() - Duration::days(60),
        },
    ]
}
