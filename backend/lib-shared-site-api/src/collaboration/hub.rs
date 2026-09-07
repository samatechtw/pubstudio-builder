use lib_command_replay::CollaborationServerMessage;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tokio::sync::broadcast;
const COLLABORATION_CHANNEL_CAPACITY: usize = 512;

/// Process-local fan-out for collaboration events. A hosted site is pinned to one
/// Site API instance because its canonical database is SQLite. Platform API uses
/// the same abstraction and can replace it with a distributed publisher if that
/// service is scaled horizontally in the future.
#[derive(Clone, Default)]
pub struct CollaborationHub {
    channels: Arc<Mutex<HashMap<String, broadcast::Sender<CollaborationServerMessage>>>>,
}

pub struct CollaborationSubscription {
    site_id: String,
    channels: Arc<Mutex<HashMap<String, broadcast::Sender<CollaborationServerMessage>>>>,
    receiver: Option<broadcast::Receiver<CollaborationServerMessage>>,
}

impl CollaborationSubscription {
    pub async fn recv(
        &mut self,
    ) -> Result<CollaborationServerMessage, broadcast::error::RecvError> {
        self.receiver
            .as_mut()
            .expect("active subscription")
            .recv()
            .await
    }
}

impl Drop for CollaborationSubscription {
    fn drop(&mut self) {
        let mut channels = self
            .channels
            .lock()
            .unwrap_or_else(|error| error.into_inner());
        // Drop the receiver under the lock so concurrent unsubscribe cannot leak a room.
        drop(self.receiver.take());
        if channels
            .get(&self.site_id)
            .is_some_and(|sender| sender.receiver_count() == 0)
        {
            channels.remove(&self.site_id);
        }
    }
}

impl CollaborationHub {
    pub fn subscribe(&self, site_id: impl Into<String>) -> CollaborationSubscription {
        let site_id = site_id.into();
        let mut channels = self
            .channels
            .lock()
            .expect("collaboration hub lock poisoned");
        let receiver = channels
            .entry(site_id.clone())
            .or_insert_with(|| broadcast::channel(COLLABORATION_CHANNEL_CAPACITY).0)
            .subscribe();
        CollaborationSubscription {
            site_id,
            channels: Arc::clone(&self.channels),
            receiver: Some(receiver),
        }
    }

    pub fn publish(&self, site_id: impl Into<String>, message: CollaborationServerMessage) {
        let site_id = site_id.into();
        let sender = {
            let mut channels = self
                .channels
                .lock()
                .expect("collaboration hub lock poisoned");
            match channels.get(&site_id) {
                Some(sender) if sender.receiver_count() > 0 => Some(sender.clone()),
                Some(_) => {
                    channels.remove(&site_id);
                    None
                }
                None => None,
            }
        };
        if let Some(sender) = sender {
            let _ = sender.send(message);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn collaboration_hub_retains_channels_only_while_subscribed() {
        let hub = CollaborationHub::default();
        let message = CollaborationServerMessage::Revision {
            current_revision: 1,
            operation_floor: 0,
            content_updated_at: 2,
        };

        hub.publish("site", message.clone());
        assert!(hub.channels.lock().unwrap().is_empty());

        let mut subscription = hub.subscribe("site");
        hub.publish("site", message.clone());
        assert_eq!(
            subscription.receiver.as_mut().unwrap().try_recv().unwrap(),
            message
        );
        drop(subscription);

        assert!(hub.channels.lock().unwrap().is_empty());
    }
}
