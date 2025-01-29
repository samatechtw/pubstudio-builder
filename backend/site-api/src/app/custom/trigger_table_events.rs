use lib_shared_site_api::{
    error::api_error::ApiError,
    mail::{send_mails, Email, MailParams, SendgridError},
};
use lib_shared_types::dto::custom_data::{
    custom_event_dto::{EmailRowOptions, EventInfo, EventTrigger},
    CustomDataRow,
};

use crate::{api_context::ApiContext, config::Config};

async fn send_add_row_mail(
    config: &Config,
    table_name: &str,
    options: EmailRowOptions,
    row: &CustomDataRow,
) -> Result<(), SendgridError> {
    let mut text = format!("A row was added to table \"{}\"\n", table_name);
    for (key, val) in row.iter() {
        text.push_str(&format!("\n{}: {}\n", key, val));
    }
    let recipients = options.recipients.iter().map(|r| Email::new(r)).collect();
    let params = MailParams {
        sender: Email::new("donotreply@pubstud.io"),
        recipients,
        api_key: config.sendgrid_api_key.clone(),
        env: config.exec_env,
    };
    send_mails(
        params,
        &format!("PubStudio row added: {}", table_name),
        Some(text.into()),
        None,
    )
    .await
}

pub fn parse_email_row_options(options: serde_json::Value) -> Result<EmailRowOptions, ApiError> {
    let row_options: EmailRowOptions = serde_json::from_value(options).map_err(|e| {
        ApiError::internal_error().message(format!("Failed to deserialize events: {}", e))
    })?;

    Ok(row_options)
}

pub async fn trigger_add_row(
    context: &ApiContext,
    table_name: &str,
    events: Vec<EventInfo>,
    row: CustomDataRow,
) -> Result<i32, ApiError> {
    println!("Trigger AddRow {:?}", events);
    let mut triggered = 0;

    for event in events.into_iter() {
        match event {
            EventInfo::EmailRow { trigger, options } => {
                if trigger == EventTrigger::AddRow {
                    let _ = send_add_row_mail(&context.config, table_name, options, &row)
                        .await
                        .map_err(|e| println!("Failed to send AddRow: {}", e));
                    triggered += 1;
                }
            }
        }
    }
    Ok(triggered)
}

async fn send_update_row_mail(
    config: &Config,
    table_name: &str,
    options: EmailRowOptions,
    old_row: &CustomDataRow,
    new_row: &CustomDataRow,
) -> Result<(), SendgridError> {
    let mut text = format!("A row was updated in table \"{}\"\n\nOld row:", table_name);
    for (key, val) in old_row.iter() {
        text.push_str(&format!("\n{}: {}\n", key, val));
    }
    text.push_str("\nNew row:");
    for (key, val) in new_row.iter() {
        text.push_str(&format!("\n{}: {}\n", key, val));
    }
    let recipients = options.recipients.iter().map(|r| Email::new(r)).collect();
    let params = MailParams {
        sender: Email::new("donotreply@pubstud.io"),
        recipients,
        api_key: config.sendgrid_api_key.clone(),
        env: config.exec_env,
    };
    send_mails(
        params,
        &format!("PubStudio row updated: {}", table_name),
        Some(text.into()),
        None,
    )
    .await
}

pub async fn trigger_update_row(
    context: &ApiContext,
    table_name: &str,
    events: Vec<EventInfo>,
    old_row: &CustomDataRow,
    new_row: &CustomDataRow,
) -> Result<i32, ApiError> {
    println!("Trigger UpdateRow {:?}", events);
    let mut triggered = 0;

    for event in events.into_iter() {
        match event {
            EventInfo::EmailRow { trigger, options } => {
                if trigger == EventTrigger::UpdateRow {
                    let _ = send_update_row_mail(
                        &context.config,
                        table_name,
                        options,
                        old_row,
                        new_row,
                    )
                    .await
                    .map_err(|e| println!("Failed to send UpdateRow: {}", e));
                    triggered += 1;
                }
            }
        }
    }
    Ok(triggered)
}
