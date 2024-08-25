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
    #[serde(rename = "image/webp")]
    #[sqlx(rename = "image/webp")]
    #[strum(serialize = "image/webp")]
    Webp,
    #[serde(rename = "image/svg+xml")]
    #[sqlx(rename = "image/svg+xml")]
    #[strum(serialize = "image/svg+xml")]
    Svg,
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
    #[serde(rename = "font/ttf")]
    #[sqlx(rename = "font/ttf")]
    #[strum(serialize = "font/ttf")]
    Ttf,
    #[serde(rename = "font/otf")]
    #[sqlx(rename = "font/otf")]
    #[strum(serialize = "font/otf")]
    Otf,
    #[serde(rename = "font/woff2")]
    #[sqlx(rename = "font/woff2")]
    #[strum(serialize = "font/woff2")]
    Woff2,
    #[serde(rename = "application/wasm")]
    #[sqlx(rename = "application/wasm")]
    #[strum(serialize = "application/wasm")]
    Wasm,
    #[serde(rename = "text/javascript")]
    #[sqlx(rename = "text/javascript")]
    #[strum(serialize = "text/javascript")]
    Js,
}

impl AssetContentType {
    pub fn get_ext(&self) -> String {
        match self {
            AssetContentType::Jpeg => "jpg",
            AssetContentType::Png => "png",
            AssetContentType::Webp => "webp",
            AssetContentType::Svg => "svg",
            AssetContentType::Gif => "gif",
            AssetContentType::Mp4 => "mp4",
            AssetContentType::Pdf => "pdf",
            AssetContentType::Wasm => "wasm",
            AssetContentType::Js => "js",
            AssetContentType::Otf => "otf",
            AssetContentType::Ttf => "ttf",
            AssetContentType::Woff2 => "woff2",
        }
        .into()
    }
}
