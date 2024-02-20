use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct ListQuery {
    #[serde(default = "default_from")]
    #[validate(range(min = 1))]
    pub from: i32,
    #[serde(default = "default_to")]
    #[validate(range(min = 1))]
    pub to: i32,
}

fn default_from() -> i32 {
    1
}

fn default_to() -> i32 {
    10
}

impl ListQuery {
    pub fn default() -> ListQuery {
        Self {
            from: default_from(),
            to: default_to(),
        }
    }
}
