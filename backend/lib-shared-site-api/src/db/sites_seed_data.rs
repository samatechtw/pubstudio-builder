use std::str::FromStr;

use chrono::{DateTime, Duration, Utc};
use lib_shared_types::{
    dto::site_api::create_site_dto::CreateSiteDto,
    shared::{core::ExecEnv, site::SiteType},
};
use uuid::Uuid;

use crate::util::domains::merge_domains;

use super::entity::platform_site_entity::PlatformSiteEntity;

pub const SITE_SEED_VERSION: &str = "0.1";
pub const SITE_SEED_DEFAULTS: &str = r##"{"head":{},"homePage":"/home"}"##;
pub const SITE_SEED_CONTEXT: &str = r##"{"namespace":"__namespace__","nextId":3,"styles":{"global-s-2":{"id":"global-s-2","name":"ContainerVerticalStyle","breakpoints":{"breakpoint-1":{"default":{"display":"flex","flex-direction":"column"}}}},"global-s-9":{"id":"global-s-9","name":"H1Style","breakpoints":{"breakpoint-1":{"default":{"color":"${color-text}","font-size":"${size-h1}","font-family":"${font-title}","font-weight":"600","margin":"0","line-height":"125%"}}}}},"behaviors":{},"theme":{"variables":{"color-title":"#000000","size-title":"40px","size-h1":"32px","size-h2":"28px","size-h3":"24px","size-h4":"20px","size-h5":"18px","size-h6":"16px","color-text":"#1b2125","size-text":"16px","size-list":"1.3rem","color-link":"#0765d3","color-link-visited":"#6E00FF","color-primary":"#95b1d1","color-active":"#2343B4","color-secondary":"#1b3858","color-disabled":"#868692","color-border":"#dddfe2","color-button-hover":"#b7c8dc","color-error":"#ef4444","font-title":"Helvetica, sans-serif","font-text":"Georgia, sans-serif"},"fonts":{}},"breakpoints":{"breakpoint-1":{"id":"breakpoint-1","name":"Desktop (default)"},"breakpoint-2":{"id":"breakpoint-2","maxWidth":980,"name":"Tablet (large)"},"breakpoint-3":{"id":"breakpoint-3","maxWidth":760,"name":"Tablet (small)"},"breakpoint-4":{"id":"breakpoint-4","maxWidth":480,"name":"Mobile"}},"i18n":{}}"##;
pub const SITE_SEED_EDITOR: &str = r##"{"selectedComponentId":"__namespace__-c-2","active":"/home","editorEvents":{},"debugBounding":false,"componentTab":{},"mode":"selC","showComponentTree":true,"componentTreeExpandedItems":{"__namespace__-c-0":true,"__namespace__-c-1":true,"__namespace__-c-2":true},"componentsHidden":{},"selectedThemeColors":[],"builderWidth":1080,"builderScale":1,"cssPseudoClass":"default","componentMenuCollapses":{"dimensions":false,"styles":false,"childStyles":true}}"##;
pub const SITE_SEED_HISTORY: &str = r##"{"back":[{"type":"g","data":{"commands":[{"type":"addC","data":{"name":"ContainerVertical","tag":"div","parentId":"__namespace__-c-0","sourceId":"global-c-containerVertical","selectedComponentId":"__namespace__-c-0","id":"__namespace__-c-1"}},{"type":"addS","data":{"id":"global-s-2","name":"ContainerVerticalStyle","breakpoints":{"breakpoint-1":{"default":{"display":"flex","flex-direction":"column"}}}}}]}},{"type":"setCCS","data":{"componentId":"__namespace__-c-1","breakpointId":"breakpoint-1","oldStyle":{"pseudoClass":"default","property":"width"},"newStyle":{"pseudoClass":"default","property":"width","value":"100%"}}},{"type":"g","data":{"commands":[{"type":"addC","data":{"name":"H1","tag":"h1","content":"Heading 1","parentId":"__namespace__-c-1","sourceId":"global-c-h1","selectedComponentId":"__namespace__-c-1","id":"__namespace__-c-2"}},{"type":"addS","data":{"id":"global-s-9","name":"H1Style","breakpoints":{"breakpoint-1":{"default":{"color":"${color-text}","font-size":"${size-h1}","font-family":"${font-title}","font-weight":"600","margin":"0","line-height":"125%"}}}}}]}},{"type":"editC","data":{"id":"__namespace__-c-2","new":{"content":"My Site"},"old":{"content":"Heading 1"}}},{"type":"setCCS","data":{"componentId":"__namespace__-c-2","breakpointId":"breakpoint-1","newStyle":{"pseudoClass":"default","property":"align-content","value":"center"}}},{"type":"setCCS","data":{"componentId":"__namespace__-c-2","breakpointId":"breakpoint-1","newStyle":{"pseudoClass":"default","property":"text-align","value":"center"}}},{"type":"setCCS","data":{"componentId":"__namespace__-c-2","breakpointId":"breakpoint-1","newStyle":{"pseudoClass":"default","property":"margin","value":"40px 0 40px 0"}}}],"forward":[]}"##;
pub const SITE_SEED_PAGES: &str = r##"{"/home":{"name":"Home","public":true,"route":"/home","head":{},"root":{"id":"__namespace__-c-0","name":"Root","tag":"div","children":[{"id":"__namespace__-c-1","name":"ContainerVertical","tag":"div","parentId":"__namespace__-c-0","children":[{"id":"__namespace__-c-2","name":"H1","tag":"h1","content":"My Site","parentId":"__namespace__-c-1","style":{"custom":{"breakpoint-1":{"default":{"align-content":"center","text-align":"center","margin":"40px 0 40px 0"}}},"mixins":["global-s-9"]}}],"style":{"custom":{"breakpoint-1":{"default":{"height":"120px","width":"100%"}}},"mixins":["global-s-2"]}}],"style":{"custom":{"breakpoint-1":{"default":{"width":"100%","height":"100%"}}},"mixins":["global-s-2"]}}}}"##;
pub const SITE_SEED_PAGE_ORDER: &str = r##"["/home"]"##;
pub const SITE_SEED_CONTACT_TABLE: &str = r##"{"table_name":"contact_form","columns":{"name":{"data_type":"TEXT","validation_rules":[{"rule_type":"Unique"}]},"age":{"data_type":"TEXT","validation_rules":[{"rule_type":"MinLength","parameter":1},{"rule_type":"MaxLength","parameter":3}]},"email":{"data_type":"TEXT","validation_rules":[{"rule_type":"Email"}]}},"events":[{"event_type":"EmailRow","trigger":"AddRow","options":{"recipients":["user1@samatech.tw"]}}]}"##;

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
                ),
            }
        })
        .collect()
}

pub fn platform_sites_seed_data() -> Vec<PlatformSiteEntity> {
    root_seed_data()
        .into_iter()
        .map(|seed| PlatformSiteEntity {
            id: seed.id,
            name: seed.name,
            site_server_id: seed.site_server_id,
            owner_id: seed.owner_id,
            site_type: seed.site_type,
            published: seed.published,
            disabled: seed.disabled,
            subdomain_record_id: seed.subdomain_record_id,
            subdomain: seed.subdomain,
            custom_domains: seed.custom_domains,
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
            custom_domains: vec!["www.myblog.org".into(), "user1-site3.localhost".into()],
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
            custom_domains: vec!["test3.com".into()],
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
