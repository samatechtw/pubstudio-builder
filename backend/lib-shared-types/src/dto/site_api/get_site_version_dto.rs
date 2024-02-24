use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
pub struct GetSiteVersionQuery {
    pub update_key: Option<i64>,
}
