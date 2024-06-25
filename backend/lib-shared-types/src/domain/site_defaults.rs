use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SiteHeadDefaults {
    pub head: SiteHead,
    pub home_page: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteHeadBase {
    pub href: String,
    pub target: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteHeadLink {
    pub href: Option<String>,
    pub rel: Option<String>,
    pub title: Option<String>,
    pub sizes: Option<String>,
    pub imagesizes: Option<String>,
    pub media: Option<String>,
    pub id: Option<String>,
    #[serde(rename = "as")]
    pub head_as: Option<String>,
    #[serde(rename = "type")]
    pub head_type: Option<String>,
    pub blocking: Option<String>,
    pub crossorigin: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteHeadMeta {
    pub content: Option<String>,
    #[serde(rename = "http-equiv")]
    pub http_equiv: Option<String>,
    pub name: Option<String>,
    pub property: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteHeadScript {
    pub src: Option<String>,
    #[serde(rename = "type")]
    pub script_type: Option<String>,
    #[serde(rename = "async")]
    pub script_async: Option<String>,
    pub blocking: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteHead {
    pub title: Option<String>,
    pub description: Option<String>,
    pub base: Option<SiteHeadBase>,
    pub link: Option<Vec<SiteHeadLink>>,
    pub meta: Option<Vec<SiteHeadMeta>>,
    pub script: Option<Vec<SiteHeadScript>>,
}
