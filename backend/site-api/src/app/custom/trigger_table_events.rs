use lib_shared_site_api::{
    error::api_error::ApiError,
    mail::{send_mails, Email, SendgridError},
};
use lib_shared_types::dto::custom_data::{
    custom_event_dto::{EmailRowOptions, EventInfo, EventTrigger, EventType},
    CustomDataRow,
};

use crate::api_context::ApiContext;

async fn send_row_mail(
    api_key: &str,
    table_name: &str,
    options: EmailRowOptions,
    row: &CustomDataRow,
) -> Result<(), SendgridError> {
    let mut text = format!("A row was added to table \"{}\"\n", table_name);
    for (key, val) in row.iter() {
        text.push_str(&format!("\n{}: {}\n", key, val));
    }
    let recipients = options.recipients.iter().map(|r| Email::new(r)).collect();
    send_mails(
        Email::new("donotreply@pubstud.io"),
        recipients,
        api_key,
        &format!("PubStudio form: {}", table_name),
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

    for event in events
        .into_iter()
        .filter(|e| e.trigger == EventTrigger::AddRow)
    {
        match event.event_type {
            EventType::EmailRow => {
                let options = parse_email_row_options(event.options)?;
                let _ = send_row_mail(&context.config.sendgrid_api_key, table_name, options, &row)
                    .await
                    .map_err(|e| println!("Failed to send AddRow: {}", e));
                triggered += 1;
            }
        }
    }
    Ok(triggered)
}
