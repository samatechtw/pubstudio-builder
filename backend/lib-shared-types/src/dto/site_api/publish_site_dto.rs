use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct PublishSiteDto {
    pub publish: bool,
}
