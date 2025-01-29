use lib_shared_site_api::mail::{ApiMailParams, Email, MailParams};

use crate::config::Config;

pub fn make_mail_params(config: &Config, to: &str) -> ApiMailParams {
    ApiMailParams {
        params: MailParams {
            sender: Email::new("donotreply@pubstud.io"),
            recipients: vec![Email::new(to)],
            api_key: config.sendgrid_api_key.clone(),
            env: config.exec_env,
        },
        domain_suffix: "".into(),
        frontend_url: config.platform_web_url.clone(),
    }
}
