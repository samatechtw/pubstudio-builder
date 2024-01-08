use serde::Serialize;
use strum::{Display, EnumString, IntoStaticStr};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Display, EnumString, IntoStaticStr)]
pub enum ExecEnv {
    #[strum(serialize = "dev")]
    Dev,

    #[strum(serialize = "ci")]
    Ci,

    #[strum(serialize = "stg")]
    Stg,

    #[strum(serialize = "prod")]
    Prod,
}
