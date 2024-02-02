use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum SiteAssetState {
    Created,
    Uploaded,
    Replacing,
    Expired,
}

#[derive(
    Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, EnumString, Display, sqlx::Type,
)]
pub enum AssetContentType {
    #[serde(rename = "image/jpeg")]
    #[sqlx(rename = "image/jpeg")]
    #[strum(serialize = "image/jpeg")]
    Jpeg,
    #[serde(rename = "image/png")]
    #[sqlx(rename = "image/png")]
    #[strum(serialize = "image/png")]
    Png,
    #[serde(rename = "image/gif")]
    #[sqlx(rename = "image/gif")]
    #[strum(serialize = "image/gif")]
    Gif,
    #[serde(rename = "video/mp4")]
    #[sqlx(rename = "video/mp4")]
    #[strum(serialize = "video/mp4")]
    Mp4,
    #[serde(rename = "application/pdf")]
    #[sqlx(rename = "application/pdf")]
    #[strum(serialize = "application/pdf")]
    Pdf,
}

impl AssetContentType {
    pub fn get_ext(&self) -> String {
        match self {
            AssetContentType::Jpeg => "jpg",
            AssetContentType::Png => "png",
            AssetContentType::Gif => "gif",
            AssetContentType::Mp4 => "mp4",
            AssetContentType::Pdf => "pdf",
        }
        .into()
    }
}
