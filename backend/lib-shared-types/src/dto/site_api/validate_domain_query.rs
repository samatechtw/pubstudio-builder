use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ValidateDomainQuery {
    #[validate(length(min = 1, max = 200))]
    pub domain: String,
}
