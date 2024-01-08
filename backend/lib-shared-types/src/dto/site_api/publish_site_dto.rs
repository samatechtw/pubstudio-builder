use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct PublishSiteDto {
    #[validate(range(min = 1))]
    pub version_id: i64,
}
