use lib_shared_types::shared::core::ExecEnv;
use reqwest::header;

use serde_json::json;
use tracing::error;

use super::{Content, MailParams, SendgridError};

pub async fn send_mails(
    params: MailParams,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), SendgridError> {
    let mut content: Vec<Content> = vec![];
    if let Some(t) = text {
        content.push(Content::new("text/plain", t))
    }
    if let Some(h) = html {
        content.push(Content::new("text/html", h))
    }

    let personalizations: Vec<serde_json::Value> = params
        .recipients
        .iter()
        .map(|r| json!({"to": [r]}))
        .collect();

    let subject_with_env = if params.env == ExecEnv::Prod {
        subject
    } else {
        &format!("({}) {}", params.env, subject)
    };

    let body = json!(
        {
            "from": params.sender,
            "personalizations": personalizations,
            "subject": subject_with_env,
            "content": content
        }
    );

    if params.env == ExecEnv::Dev || params.env == ExecEnv::Ci {
        return Ok(());
    }

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.sendgrid.com/v3/mail/send")
        .json(&body)
        .bearer_auth(params.api_key)
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
    params: MailParams,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), SendgridError> {
    send_mails(params, subject, text, html).await
}
