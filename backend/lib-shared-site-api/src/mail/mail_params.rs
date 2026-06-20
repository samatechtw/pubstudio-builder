use lib_shared_types::shared::core::ExecEnv;
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct MailParams {
    pub sender: Email,
    pub recipients: Vec<Email>,
    pub api_key: String,
    pub env: ExecEnv,
}

#[derive(Debug, Clone)]
pub struct ApiMailParams {
    pub params: MailParams,
    pub domain_suffix: String,
    pub frontend_url: String,
}

impl ApiMailParams {
    pub fn set_recipient(&mut self, to: String) {
        self.params.recipients = vec![Email::new(&to)];
    }
}

#[derive(Debug, Clone, Serialize)]
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

#[derive(Debug, Error)]
pub enum MailError {
    #[error("Failed to send: {0}")]
    Failed(String),
    #[error("Template parse: {0}")]
    Template(String),
}
