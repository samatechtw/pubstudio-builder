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
    send_mails_to(
        params,
        subject,
        text,
        html,
        "https://api.mailersend.com/v1/email",
    )
    .await
}

async fn send_mails_to(
    params: MailParams,
    subject: &str,
    text: Option<String>,
    html: Option<String>,
    endpoint: &str,
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
    // request per recipient and aggregate any failures.
    let client = reqwest::Client::new();
    let mut errors: Vec<String> = vec![];
    let mut unavailable = false;

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
            .post(endpoint)
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
                    error!(status, body = body, "Failed to send mail");
                    unavailable |= provider_unavailable(status, &body);
                    errors.push(format!("{}: {}", status, body));
                }
            }
            Err(e) => {
                error!(error = e.to_string(), "Failed to send mail");
                errors.push(e.to_string());
            }
        }
    }

    if unavailable {
        Err(MailError::Unavailable)
    } else if errors.is_empty() {
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

// Only the documented quota code is an outage; invalid recipients also use 422.
fn provider_unavailable(status: u16, body: &str) -> bool {
    status == 401 || (status == 422 && body.contains("MS42204"))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn classifies_provider_responses() {
        assert!(provider_unavailable(
            401,
            r#"{"message":"Unauthenticated."}"#
        ));
        assert!(provider_unavailable(
            422,
            r#"{"message":"Your account reached its email usage limit. #MS42204"}"#
        ));
        assert!(!provider_unavailable(
            422,
            r#"{"message":"Invalid address #MS42208"}"#
        ));
        assert!(!provider_unavailable(422, "Validation error"));
        assert!(!provider_unavailable(202, ""));
        assert!(!provider_unavailable(500, "Server error"));
    }
    #[tokio::test]
    async fn propagates_mock_provider_failures() {
        use axum::{http::StatusCode, routing::post, Router};
        for (status, body, outage) in [
            (401, r#"{"message":"Unauthenticated."}"#, true),
            (422, r#"{"message":"Email usage limit #MS42204"}"#, true),
            (422, r#"{"message":"Invalid recipient #MS42208"}"#, false),
            (202, "", false),
        ] {
            let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
            let endpoint = format!("http://{}", listener.local_addr().unwrap());
            let app = Router::new().route(
                "/",
                post(move || async move { (StatusCode::from_u16(status).unwrap(), body) }),
            );
            let server = tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
            let params = MailParams {
                sender: super::super::Email::new("sender@example.com"),
                recipients: vec![super::super::Email::new("recipient@example.com")],
                api_key: "mock-only".into(),
                env: ExecEnv::Prod,
            };
            let result = send_mails_to(params, "Test", Some("Test".into()), None, &endpoint).await;
            server.abort();
            if status == 202 {
                assert!(result.is_ok());
            } else if outage {
                assert!(matches!(result, Err(MailError::Unavailable)));
            } else {
                assert!(matches!(result, Err(MailError::Failed(_))));
            }
        }
    }
}
