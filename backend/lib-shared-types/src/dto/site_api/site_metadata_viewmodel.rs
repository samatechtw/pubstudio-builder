use serde::Serialize;

#[derive(Serialize)]
pub struct SiteMetadataViewModel {
    pub id: String,
    pub location: String,
    pub disabled: bool,
}
