use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
pub struct GetCurrentSiteQuery {
    pub p: Option<String>,
}
