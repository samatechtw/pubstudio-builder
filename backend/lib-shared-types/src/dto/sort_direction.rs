use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display)]
#[serde(rename_all = "lowercase")]
pub enum SortDirection {
    Asc,
    Desc,
}
