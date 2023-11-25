use std::str::FromStr;

use chrono::{Duration, Utc};
use lib_shared_types::shared::site::SiteType;
use uuid::Uuid;

use super::entity::platform_site_entity::PlatformSiteEntity;

pub const SITE_SEED_NAME: &str = "test";
pub const SITE_SEED_VERSION: &str = "0.1";
pub const SITE_SEED_CONTEXT: &str = r##"{"namespace":"test","nextId":3,"styles":{"global-s-1":{"id":"global-s-1","name":"ContainerHorizontalStyle","breakpoints":{"breakpoint-1":{"default":{"display":"flex","flex-direction":"row","align-items":"flex-start","width":"100%"}}}},"global-s-8":{"id":"global-s-8","name":"TextStyle","breakpoints":{"breakpoint-1":{"default":{"margin":"0px","color":"${color-text}","font-size":"${size-text}","font-family":"${font-text}"}}}}},"behaviors":{},"theme":{"variables":{"color-title":"#000000","size-title":"40px","size-h1":"32px","size-h2":"28px","size-h3":"24px","size-h4":"20px","size-h5":"18px","size-h6":"16px","color-text":"#1b2125","size-text":"16px","color-link":"#0765d3","color-link-visited":"#6E00FF","color-primary":"#95b1d1","color-active":"#2343B4","color-secondary":"#1b3858","color-disabled":"#868692","color-border":"#dddfe2","color-button-hover":"#b7c8dc"},"fonts":{}},"breakpoints":{"breakpoint-1":{"id":"breakpoint-1","name":"Desktop (default)"},"breakpoint-2":{"id":"breakpoint-2","maxWidth":980,"name":"Tablet (large)"},"breakpoint-3":{"id":"breakpoint-3","maxWidth":760,"name":"Tablet (small)"},"breakpoint-4":{"id":"breakpoint-4","maxWidth":480,"name":"Mobile"}}}"##;
pub const SITE_SEED_DEFAULTS: &str = r##"{"head":{},"homePage":"/home"}"##;
pub const SITE_SEED_EDITOR: &str = r##"{"selectedComponentId":"test-c-0","active":"/home","editorEvents":{},"debugBounding":false,"buildSubmenu":"file","componentTab":{"type":"style"},"mode":"selC","showComponentTree":true,"componentsHidden":{},componentTreeExpandedItems":{"test-c-0":true,"test-c-1":true,"test-c-2":true},"selectedThemeColors":[],"builderWidth":1080,"builderScale":0.81,"cssPseudoClass":"default"}"##;
pub const SITE_SEED_HISTORY: &str = r##"{"back":[{"type":"editC","data":{"id":"test-c-2","new":{"content":"<p>My Site</p>"},"old":{"content":"text content"}}},{"type":"setCCS","data":{"componentId":"test-c-2","breakpointId":"breakpoint-1","oldStyle":{"pseudoClass":"default","property":"font-size","value":"16px"},"newStyle":{"pseudoClass":"default","property":"font-size","value":"28px"}}},{"type":"setCCS","data":{"componentId":"test-c-2","breakpointId":"breakpoint-1","oldStyle":{"pseudoClass":"default","property":"font-weight","value":"500"},"newStyle":{"pseudoClass":"default","property":"font-weight","value":"700"}}},{"type":"setCCS","data":{"componentId":"test-c-2","breakpointId":"breakpoint-1","oldStyle":{"pseudoClass":"default","property":"font-family","value":"${font-text}"},"newStyle":{"pseudoClass":"default","property":"font-family","value":"${font-title}","sourceType":"mixin","sourceId":"global-s-8","sourceBreakpointId":"breakpoint-1"}}},{"type":"setCCS","data":{"breakpointId":"breakpoint-1","componentId":"test-c-0","newStyle":{"pseudoClass":"default","property":"background-color","value":"rgba(206,203,237,1)"}}},{"type":"setCCS","data":{"breakpointId":"breakpoint-1","componentId":"test-c-0","oldStyle":{"pseudoClass":"default","property":"background-color","value":"rgba(206,203,237,1)"},"newStyle":{"pseudoClass":"default","property":"background-color","value":"rgba(221,221,246,1)"}}}],"forward":[]}"##;
pub const SITE_SEED_PAGES: &str = r##"{"/home":{"name":"Home","route":"/home","root":{"id":"test-c-0","name":"Root","tag":"div","children":[{"id":"test-c-1","name":"ContainerHorizontal","tag":"div","parentId":"test-c-0","children":[{"id":"test-c-2","name":"Text","tag":"p","content":"<p>My Site</p>","parentId":"test-c-1","style":{"custom":{"breakpoint-1":{"default":{"font-size":"28px","font-weight":"700","font-family":"${font-title}"}}},"mixins":["global-s-8"]}}],"style":{"custom":{"breakpoint-1":{"default":{"height":"120px","width":"100%","justify-content":"center","align-items":"center"}}},"mixins":["global-s-1"]}}],"style":{"custom":{"breakpoint-1":{"default":{"width":"100%","height":"100%","background-color":"rgba(221,221,246,1)"}}},"mixins":["global-s-2"]}},"public":true,"head":{}}}"##;

pub fn stringified_json(str: &str) -> String {
    let val: serde_json::Value = str.into();
    val.to_string()
}

pub fn sites_seed_data() -> Vec<PlatformSiteEntity> {
    vec![
        PlatformSiteEntity {
            id: Uuid::from_str("2af5f0a4-c273-42ff-b5bc-847332cbb29f").unwrap(),
            name: "Test Site 1".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // admin1@samatech.tw
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
        PlatformSiteEntity {
            id: Uuid::from_str("6d2c8359-6094-402c-bcbb-37202fd7c336").unwrap(),
            name: "Test Site 2".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user1@samatech.tw
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            site_type: SiteType::Free,
            published: false,
            disabled: false,
            subdomain_record_id: "user1-site2-record-id".into(),
            subdomain: "user1-site2-subdomain".into(),
            custom_domains: vec!["www.myblog.org".into(), "user1-site3.localhost".into()],
            created_at: Utc::now() + Duration::days(1),
            updated_at: Utc::now(),
        },
        PlatformSiteEntity {
            id: Uuid::from_str("870aafc9-36e9-476a-b38c-c1aaaad9d9fe").unwrap(),
            name: "Test Site 3".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user1@samatech.tw
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            site_type: SiteType::Paid2,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site3-record-id".into(),
            subdomain: "user1-site3-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() + Duration::days(2),
            updated_at: Utc::now(),
        },
        PlatformSiteEntity {
            id: Uuid::from_str("d58080e9-dea0-434b-abda-c314b2001b23").unwrap(),
            name: "Test Site 4".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user3@samatech.tw
            owner_id: Uuid::from_str("3ba201ff-a8d8-42bb-84ef-8470e6d97f78").unwrap(),
            site_type: SiteType::Paid3,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site4-record-id".into(),
            subdomain: "user1-site4-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(59),
            updated_at: Utc::now() - Duration::days(59),
        },
        PlatformSiteEntity {
            id: Uuid::from_str("8b088c7f-1605-40ea-96e9-430b4c2863fd").unwrap(),
            name: "Test Site 5".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user1@samatech.tw
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            site_type: SiteType::Paid1,
            published: true,
            disabled: true,
            subdomain_record_id: "user1-site5-record-id".into(),
            subdomain: "user1-site5-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(60),
            updated_at: Utc::now() - Duration::days(60),
        },
        PlatformSiteEntity {
            id: Uuid::from_str("4c5f525b-60a3-4908-80dd-3d44bfa3d577").unwrap(),
            name: "Test Site 6".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user1@samatech.tw
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
            site_type: SiteType::Paid1,
            published: true,
            disabled: false,
            subdomain_record_id: "user1-site6-record-id".into(),
            subdomain: "user1-site6-subdomain".into(),
            custom_domains: Vec::new(),
            created_at: Utc::now() - Duration::days(61),
            updated_at: Utc::now() - Duration::days(61),
        },
        PlatformSiteEntity {
            id: Uuid::from_str("ad01f2e0-0f4b-4c86-a8af-800d5cc4f812").unwrap(),
            name: "Test Site 7".into(),
            site_server_id: Uuid::from_str("d8ebea55-0adf-4858-8ebb-72d6b35e92a3").unwrap(),
            // user1@samatech.tw
            owner_id: Uuid::from_str("903b3c28-deaa-45dc-a43f-511fe965d34e").unwrap(),
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
