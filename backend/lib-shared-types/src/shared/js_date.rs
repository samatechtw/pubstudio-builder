use core::fmt;

use chrono::{DateTime, Utc};
use serde::{de, Deserialize, Serialize, Serializer};

#[derive(Clone, sqlx::Type, Debug)]
pub struct JsDate {
    pub timestamp: DateTime<Utc>,
}

pub fn format_js_date(date: DateTime<Utc>) -> String {
    date.format("%Y-%m-%dT%H:%M:%S%.6fZ").to_string()
}

impl Serialize for JsDate {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let serialized_date = format_js_date(self.timestamp);
        serializer.serialize_str(&serialized_date)
    }
}

struct JsDateVisitor;

impl<'de> de::Visitor<'de> for JsDateVisitor {
    type Value = JsDate;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a formatted date and time string or a unix timestamp")
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        // DateTime<Utc>::FromStr(value).map_err(E::custom)
        value
            .parse::<DateTime<Utc>>()
            .and_then(|d| Ok(JsDate { timestamp: d }))
            .map_err(E::custom)
    }
}

impl<'de> Deserialize<'de> for JsDate {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: de::Deserializer<'de>,
    {
        // serde_json::from_str(s).unwrap()
        deserializer.deserialize_str(JsDateVisitor)
    }
}

impl JsDate {
    pub fn now() -> JsDate {
        Self {
            timestamp: Utc::now(),
        }
    }
}
