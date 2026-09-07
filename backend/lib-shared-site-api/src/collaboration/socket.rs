//! Shared authenticated WebSocket transport; storage and authorization stay with each API.
use super::hub::CollaborationSubscription;
use axum::extract::ws::{Message, WebSocket};
use lib_command_replay::{
    CollaborationClientMessage, CollaborationServerMessage, OperationsResponse,
};
use std::{future::Future, time::Duration};
use tokio::{
    sync::broadcast,
    time::{interval, timeout},
};

pub const MAX_CLIENT_MESSAGE_BYTES: usize = 16 * 1024;

pub async fn read_authentication(socket: &mut WebSocket) -> Option<(String, i64)> {
    let auth = timeout(Duration::from_secs(10), socket.recv()).await;
    let (token, after_revision) = match auth {
        Ok(Some(Ok(Message::Text(text)))) => {
            match serde_json::from_str::<CollaborationClientMessage>(text.as_str()) {
                Ok(CollaborationClientMessage::Authenticate {
                    token,
                    after_revision,
                }) => (token, after_revision.max(0)),
                Err(_) => {
                    close_with_error(socket, "InvalidMessage", "authenticate first").await;
                    return None;
                }
            }
        }
        _ => {
            close_with_error(socket, "AuthenticationTimeout", "authenticate first").await;
            return None;
        }
    };

    Some((token, after_revision))
}

pub async fn serve<F, Fut, E>(
    mut socket: WebSocket,
    mut receiver: CollaborationSubscription,
    after_revision: i64,
    load: F,
) where
    F: Fn(i64) -> Fut,
    Fut: Future<Output = Result<OperationsResponse, E>>,
{
    let response = match load(after_revision).await {
        Ok(response) => response,
        Err(_) => {
            close_with_error(&mut socket, "CollaborationUnavailable", "catch-up failed").await;
            return;
        }
    };
    if !send_message(
        &mut socket,
        &CollaborationServerMessage::Authenticated {
            current_revision: response.current_revision,
            operation_floor: response.operation_floor,
            content_updated_at: response.content_updated_at,
        },
    )
    .await
    {
        return;
    }
    let Some(mut last_revision) = send_catchup(&mut socket, after_revision, response).await else {
        return;
    };

    let mut heartbeat = interval(Duration::from_secs(25));
    heartbeat.tick().await;
    loop {
        tokio::select! {
            incoming = socket.recv() => match incoming {
                Some(Ok(Message::Close(_))) | None | Some(Err(_)) => return,
                // Pings are answered by axum; nothing else is expected after authentication
                Some(Ok(_)) => {}
            },
            event = receiver.recv() => match event {
                Ok(CollaborationServerMessage::Operation { operation, content_updated_at: updated_at }) => {
                    if operation.revision <= last_revision { continue; }
                    if operation.revision != last_revision + 1 {
                        let Ok(response) = load(last_revision).await else { return; };
                        let Some(revision) = send_catchup(&mut socket, last_revision, response).await else { return; };
                        last_revision = revision;
                        continue;
                    }
                    last_revision = operation.revision;
                    if !send_message(&mut socket, &CollaborationServerMessage::Operation {
                        operation,
                        content_updated_at: updated_at,
                    }).await { return; }
                }
                Ok(CollaborationServerMessage::SnapshotReset { revision, operation_floor, content_updated_at: updated_at }) => {
                    last_revision = revision;
                    if !send_message(&mut socket, &CollaborationServerMessage::SnapshotReset {
                        revision,
                        operation_floor,
                        content_updated_at: updated_at,
                    }).await { return; }
                }
                Ok(_) => {}
                Err(broadcast::error::RecvError::Lagged(_)) => {
                    let Ok(response) = load(last_revision).await else { return; };
                    let Some(revision) = send_catchup(&mut socket, last_revision, response).await else { return; };
                    last_revision = revision;
                }
                Err(broadcast::error::RecvError::Closed) => return,
            },
            _ = heartbeat.tick() => {
                let Ok(response) = load(last_revision).await else { return; };
                let Some(revision) = send_catchup(&mut socket, last_revision, response).await else { return; };
                last_revision = revision;
            }
        }
    }
}

async fn send_catchup(
    socket: &mut WebSocket,
    after_revision: i64,
    response: OperationsResponse,
) -> Option<i64> {
    if requires_snapshot(after_revision, &response) {
        send_message(
            socket,
            &CollaborationServerMessage::SnapshotReset {
                revision: response.current_revision,
                operation_floor: response.operation_floor,
                content_updated_at: response.content_updated_at,
            },
        )
        .await
        .then_some(response.current_revision)
    } else {
        for operation in response.operations {
            if !send_message(
                socket,
                &CollaborationServerMessage::Operation {
                    operation,
                    content_updated_at: response.content_updated_at,
                },
            )
            .await
            {
                return None;
            }
        }
        send_message(
            socket,
            &CollaborationServerMessage::Revision {
                current_revision: response.current_revision,
                operation_floor: response.operation_floor,
                content_updated_at: response.content_updated_at,
            },
        )
        .await
        .then_some(response.current_revision)
    }
}

pub async fn close_with_error(socket: &mut WebSocket, code: &str, message: &str) {
    let _ = send_message(
        socket,
        &CollaborationServerMessage::Error {
            code: code.into(),
            message: message.into(),
        },
    )
    .await;
    let _ = timeout(Duration::from_secs(10), socket.send(Message::Close(None))).await;
}

async fn send_message(socket: &mut WebSocket, message: &CollaborationServerMessage) -> bool {
    let Ok(text) = serde_json::to_string(message) else {
        return false;
    };
    matches!(
        timeout(
            Duration::from_secs(10),
            socket.send(Message::Text(text.into()))
        )
        .await,
        Ok(Ok(()))
    )
}

fn requires_snapshot(after_revision: i64, response: &OperationsResponse) -> bool {
    response.snapshot_required
        || response.operation_floor > after_revision.saturating_add(1)
        || response.current_revision < after_revision
        || response
            .operations
            .last()
            .map_or(after_revision, |op| op.revision)
            != response.current_revision
        || response
            .operations
            .iter()
            .enumerate()
            .any(|(index, operation)| {
                operation.revision
                    != after_revision
                        .saturating_add(1)
                        .saturating_add(index as i64)
            })
}

#[cfg(test)]
mod tests {
    use super::*;
    use lib_command_replay::AcceptedOperation;

    fn response(revision: i64, revisions: &[i64]) -> OperationsResponse {
        OperationsResponse {
            current_revision: revision,
            operation_floor: 0,
            content_updated_at: 0,
            snapshot_required: false,
            operations: revisions
                .iter()
                .map(|revision| AcceptedOperation {
                    revision: *revision,
                    protocol_version: 1,
                    batch_id: revision.to_string(),
                    client_id: "test".into(),
                    base_revision: revision - 1,
                    commands: vec![],
                    author_id: None,
                    created_at: "".into(),
                })
                .collect(),
        }
    }

    #[test]
    fn catchup_requires_a_complete_contiguous_log() {
        assert!(!requires_snapshot(0, &response(2, &[1, 2])));
        assert!(!requires_snapshot(2, &response(2, &[])));
        assert!(requires_snapshot(0, &response(3, &[1, 2])));
        assert!(requires_snapshot(0, &response(3, &[1, 3])));
        assert!(requires_snapshot(2, &response(1, &[])));
        assert!(requires_snapshot(i64::MAX, &response(0, &[])));
        assert!(!requires_snapshot(i64::MAX, &response(i64::MAX, &[])));
        let mut compacted = response(2, &[1, 2]);
        compacted.operation_floor = 2;
        assert!(requires_snapshot(0, &compacted));
        compacted.operation_floor = 0;
        compacted.snapshot_required = true;
        assert!(requires_snapshot(0, &compacted));
    }
}
