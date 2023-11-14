use serde::Serialize;
use tokio::task::JoinHandle;

use super::{ChannelReceiver, ChannelSender};

// Maximum number of retries for failed requests
const MAX_RETRIES: usize = 3;

// Provides a background worker task that sends the messages generated by the layer.
pub(crate) async fn send_message(mut rx: ChannelReceiver) {
    let client = reqwest::Client::new();
    while let Some(message) = rx.recv().await {
        match message {
            WorkerMessage::Data(payload) => {
                let webhook_url = payload.webhook_url().to_string();

                let payload_str =
                    serde_json::to_string(&payload).expect("failed to deserialize slack payload");

                let mut retries = 0;
                while retries < MAX_RETRIES {
                    match client
                        .post(webhook_url.clone())
                        .body(payload_str.clone())
                        .send()
                        .await
                    {
                        Ok(_) => {
                            break;
                        }
                        Err(e) => {
                            println!("{}", format!("Failed to send slack message: {}", e));
                        }
                    };

                    // Exponential backoff - increase the delay between retries
                    let delay_ms = 2u64.pow(retries as u32) * 100;
                    tokio::time::sleep(std::time::Duration::from_millis(delay_ms)).await;
                    retries += 1;
                }
            }
            WorkerMessage::Shutdown => {
                break;
            }
        }
    }
}

// Worker for managing a background async task that schedules network requests to send traces to the Slack on the tokio runtime.
// Synchronously generates payloads to send to the Slack API using tracing events from the global subscriber.
// All network requests are offloaded onto an unbuffered channel and processed by a provided future acting as an asynchronous worker.
pub struct SlackBackgroundWorker {
    pub(crate) sender: ChannelSender,
    pub(crate) handle: JoinHandle<()>,
}

impl SlackBackgroundWorker {
    // Initiate the worker's shutdown sequence.
    pub async fn shutdown(self) {
        self.sender.send(WorkerMessage::Shutdown).unwrap();
        self.handle.await.unwrap();
    }
}

#[derive(Debug)]
pub(crate) enum WorkerMessage {
    Data(SlackPayload),
    Shutdown,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct SlackPayload {
    blocks: String,
    #[serde(skip_serializing)]
    webhook_url: String,
}

impl SlackPayload {
    pub(crate) fn new(blocks: String, webhook_url: String) -> Self {
        Self {
            blocks,
            webhook_url,
        }
    }
}

impl SlackPayload {
    pub fn webhook_url(&self) -> &str {
        self.webhook_url.as_str()
    }
}
