use std::collections::HashMap;

use lib_shared_types::shared::core::ExecEnv;
use serde::Serialize;
use serde::{ser::SerializeMap, Serializer};
use serde_json::{Error, Value};
use tracing_bunyan_formatter::JsonStorage;
use tracing_core::{Event, Level, Subscriber};
use tracing_subscriber::{
    layer::Context,
    registry::{LookupSpan, SpanRef},
    Layer,
};

use super::{
    worker::{send_message, SlackBackgroundWorker, SlackPayload, WorkerMessage},
    ChannelSender,
};

const KEYWORDS: [&str; 2] = ["message", "error"];

pub struct SlackLayer {
    info_webhook_url: String,  // Slack webhook URL for INFO level
    error_webhook_url: String, // Slack webhook URL for ERROR level
    exec_env: ExecEnv,
    slack_sender: ChannelSender,
}

pub struct SlackLayerParams {
    pub info_url: String,
    pub error_url: String,
    pub exec_env: ExecEnv,
}

#[derive(Serialize)]
struct SlackText {
    #[serde(rename = "type")]
    s_type: String,
    text: String,
}

#[derive(Serialize)]
struct SlackMessage {
    #[serde(rename = "type")]
    s_type: String,
    text: SlackText,
}

impl SlackMessage {
    fn section_text(text: &str) -> Self {
        SlackMessage {
            s_type: "section".into(),
            text: SlackText {
                s_type: "mrkdwn".into(),
                text: text.into(),
            },
        }
    }
}

impl SlackLayer {
    pub fn new(params: SlackLayerParams) -> (SlackLayer, SlackBackgroundWorker) {
        let (tx, rx) = tokio::sync::mpsc::unbounded_channel();

        let layer = SlackLayer {
            info_webhook_url: params.info_url,
            error_webhook_url: params.error_url,
            exec_env: params.exec_env,
            slack_sender: tx.clone(),
        };

        let worker = SlackBackgroundWorker {
            sender: tx,
            handle: tokio::spawn(send_message(rx)),
        };

        (layer, worker)
    }

    fn extract_message(event_visitor: &JsonStorage) -> String {
        event_visitor
            .values()
            .get("message")
            .and_then(|v| match v {
                Value::String(s) => Some(s.as_str()),
                _ => None,
            })
            .or_else(|| {
                event_visitor.values().get("error").and_then(|v| match v {
                    Value::String(s) => Some(s.as_str()),
                    _ => None,
                })
            })
            .unwrap_or("No message")
            .to_string()
    }

    fn extract_metadata<S>(
        event_visitor: &JsonStorage<'_>,
        current_span: &Option<SpanRef<'_, S>>,
    ) -> Result<String, Error>
    where
        S: Subscriber + for<'a> LookupSpan<'a>,
    {
        let mut metadata_buffer = Vec::new();
        let mut serializer = serde_json::Serializer::new(&mut metadata_buffer);
        let mut map_serializer = serializer.serialize_map(None)?;

        // Add all the other fields associated with the event, except the message.
        for (key, value) in event_visitor
            .values()
            .iter()
            .filter(|(&key, _)| !KEYWORDS.contains(&key))
        {
            map_serializer.serialize_entry(key, value)?;
        }

        // Add all the fields from the current span, if available.
        if let Some(span) = current_span {
            let extensions = span.extensions();
            if let Some(visitor) = extensions.get::<JsonStorage>() {
                for (key, value) in visitor.values() {
                    map_serializer.serialize_entry(key, value)?;
                }
            }
        }
        map_serializer.end()?;

        let metadata = {
            let data: HashMap<String, serde_json::Value> =
                serde_json::from_slice(metadata_buffer.as_slice()).unwrap();
            serde_json::to_string_pretty(&data).unwrap()
        };

        Ok(metadata)
    }

    fn build_blocks(
        message: String,
        event: &Event,
        metadata: String,
    ) -> Result<String, serde_json::Error> {
        let event_level = event.metadata().level();
        let event_level_emoji = match *event_level {
            Level::TRACE => ":mag:",
            Level::DEBUG => ":bug:",
            Level::INFO => ":information_source:",
            Level::WARN => ":warning:",
            Level::ERROR => ":x:",
        };

        let mut blocks = vec![
            SlackMessage::section_text(&format!("{} *{}*", event_level_emoji, event_level)),
            SlackMessage::section_text(&format!("> *{}*", message)),
            SlackMessage::section_text(&format!(
                "*Source*\n{}",
                &event.metadata().name().replace("event", "")
            )),
        ];
        if metadata.len() > 0 && metadata != "{}" {
            blocks.push(SlackMessage::section_text("*Metadata:*"));
            blocks.push(SlackMessage::section_text(&format!(
                "```\n{}\n```",
                metadata
            )))
        }

        serde_json::to_string(&blocks)
    }
}

impl<S> Layer<S> for SlackLayer
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn on_event(&self, event: &tracing::Event, ctx: Context<'_, S>) {
        let current_span = ctx.lookup_current();
        let mut event_visitor = JsonStorage::default();
        event.record(&mut event_visitor);

        // Extract the message field
        let message = Self::extract_message(&event_visitor);

        // Check if the message is empty and return early if it is.
        if message.is_empty() {
            return;
        }

        // Extract metadata
        let metadata = Self::extract_metadata(&event_visitor, &current_span)
            .unwrap_or_else(|_| "Metadata parsing error".to_string());

        // Determine the webhook URL based on event level
        let webhook_url = match *event.metadata().level() {
            Level::INFO => &self.info_webhook_url,
            Level::ERROR => &self.error_webhook_url,
            _ => {
                // Default webhook URL or handle other levels as needed
                &self.info_webhook_url
            }
        };

        // Build blocks
        let blocks_result = Self::build_blocks(message, event, metadata);
        match blocks_result {
            Ok(blocks) => {
                if self.exec_env == ExecEnv::Dev || self.exec_env == ExecEnv::Ci {
                    println!("Skip slack log: {blocks}");
                    return;
                }
                let payload = SlackPayload::new(blocks, webhook_url.to_string());
                if let Err(e) = self.slack_sender.send(WorkerMessage::Data(payload)) {
                    println!(
                        "ERROR: failed to send slack payload to given channel, {}",
                        e.to_string()
                    )
                };
            }
            Err(e) => tracing::error!("failed to format slack message: {}", e),
        }
    }
}
