use std::{collections::HashMap, env};

use lib_shared_types::shared::core::ExecEnv;
use reqwest::header;
use serde::Serialize;

use serde_json::json;
use thiserror::Error;
use tracing::error;

#[derive(Clone, Serialize)]
pub struct Email {
    pub email: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl Email {
    pub fn new(email: &str) -> Self {
        Self {
            email: email.to_string(),
            name: None,
        }
    }
    pub fn full(email: String, name: String) -> Self {
        Self {
            email,
            name: Some(name),
        }
    }
}

#[derive(Clone, Serialize)]
struct Content {
    r#type: String,

    value: String,
}

impl Content {
    fn new(t: &str, value: String) -> Self {
        Self {
            r#type: t.into(),
            value,
        }
    }
}

#[derive(Serialize)]
pub struct Personalization {
    to: Vec<Email>,

    #[serde(skip_serializing_if = "Option::is_none")]
    cc: Option<Vec<Email>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    bcc: Option<Vec<Email>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    subject: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    substitutions: Option<HashMap<String, String>>,
}

#[derive(Debug, Error)]
pub enum SendgridError {
    #[error("Failed to send: {0}")]
    Failed(String),
    #[error("Template parse: {0}")]
    Template(String),
}

pub async fn send_mails(
    sender: Email,
    recipients: Vec<Email>,
    api_key: &str,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), SendgridError> {
    let env_str = env::var("EXEC_ENV").unwrap_or("dev".into());
    let env: ExecEnv = env_str.to_owned().parse().unwrap_or(ExecEnv::Dev);

    let mut content: Vec<Content> = vec![];
    if let Some(t) = text {
        content.push(Content::new("text/plain", t))
    }
    if let Some(h) = html {
        content.push(Content::new("text/html", h))
    }

    let personalizations: Vec<serde_json::Value> =
        recipients.iter().map(|r| json!({"to": [r]})).collect();

    let body = json!(
        {
            "from": sender,
            "personalizations": personalizations,
            "subject": subject,
            "content": content
        }
    );

    if env == ExecEnv::Dev || env == ExecEnv::Ci {
        return Ok(());
    }

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.sendgrid.com/v3/mail/send")
        .json(&body)
        .bearer_auth(api_key)
        .header(
            header::CONTENT_TYPE,
            header::HeaderValue::from_static("application/json"),
        )
        .send()
        .await
        .map_err(|e| SendgridError::Failed(e.to_string()))?;

    let status = res.status().as_u16();
    match status {
        200..=299 => Ok(()),
        _ => {
            let body = res
                .text()
                .await
                .map_err(|e| SendgridError::Failed(e.to_string()))?;
            error!(body = body, "Failed to send mail");
            Err(SendgridError::Failed(format!("{}: {}", status, body)))
        }
    }
}

pub async fn send_mail(
    sender: Email,
    recipient: Email,
    api_key: &str,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), SendgridError> {
    send_mails(sender, vec![recipient], api_key, subject, text, html).await
}
