use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ResetAllDto {
    pub seeds: Vec<String>,
}
