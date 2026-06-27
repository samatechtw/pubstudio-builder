use lib_shared_types::shared::core::ExecEnv;
use reqwest::header;

use serde_json::json;
use tracing::{error, info};

use super::{MailError, MailParams};

const SLACK_BODY_PREVIEW_LEN: usize = 2000;

pub async fn send_mails(
    params: MailParams,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), MailError> {
    if params.env == ExecEnv::Dev || params.env == ExecEnv::Ci {
        return Ok(());
    }

    let subject_with_env = if params.env == ExecEnv::Prod {
        subject.to_string()
    } else {
        format!("({}) {}", params.env, subject)
    };

    // In stg, bypass the mail provider and send to stg-info Slack channel.
    if params.env == ExecEnv::Stg {
        let recipients = params
            .recipients
            .iter()
            .map(|r| r.email.as_str())
            .collect::<Vec<_>>()
            .join(", ");
        let full_body = text.or(html).unwrap_or_default();
        let body = if full_body.chars().count() > SLACK_BODY_PREVIEW_LEN {
            let preview: String = full_body.chars().take(SLACK_BODY_PREVIEW_LEN).collect();
            format!("{preview}… (truncated)")
        } else {
            full_body
        };
        info!(
            recipients = recipients,
            body = body,
            "Staging mail bypass: {}",
            subject_with_env
        );
        return Ok(());
    }

    // MailerSend's `to` array does not isolate recipients from each other, so send one
    // request per recipient and ggregate any failures.
    let client = reqwest::Client::new();
    let mut errors: Vec<String> = vec![];

    for recipient in params.recipients.iter() {
        let mut body = json!({
            "from": params.sender,
            "to": [recipient],
            "subject": subject_with_env,
        });
        if let Some(t) = &text {
            body["text"] = json!(t);
        }
        if let Some(h) = &html {
            body["html"] = json!(h);
        }

        let res = client
            .post("https://api.mailersend.com/v1/email")
            .json(&body)
            .bearer_auth(&params.api_key)
            .header(
                header::CONTENT_TYPE,
                header::HeaderValue::from_static("application/json"),
            )
            .header(
                "X-Requested-With",
                header::HeaderValue::from_static("XMLHttpRequest"),
            )
            .send()
            .await;

        match res {
            Ok(res) => {
                let status = res.status().as_u16();
                if !(200..=299).contains(&status) {
                    let body = res.text().await.unwrap_or_else(|e| e.to_string());
                    error!(body = body, "Failed to send mail");
                    errors.push(format!("{}: {}", status, body));
                }
            }
            Err(e) => {
                error!(error = e.to_string(), "Failed to send mail");
                errors.push(e.to_string());
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(MailError::Failed(errors.join("; ")))
    }
}

pub async fn send_mail(
    params: MailParams,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
) -> Result<(), MailError> {
    send_mails(params, subject, text, html).await
}
