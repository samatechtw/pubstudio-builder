use self::worker::WorkerMessage;

pub mod slack_layer;
pub mod worker;

pub(crate) type ChannelSender = tokio::sync::mpsc::UnboundedSender<WorkerMessage>;
pub(crate) type ChannelReceiver = tokio::sync::mpsc::UnboundedReceiver<WorkerMessage>;
