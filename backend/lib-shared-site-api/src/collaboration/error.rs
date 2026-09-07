use crate::error::api_error::ApiError;
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use lib_command_replay::ReplayError;
use serde::Serialize;

#[derive(Serialize)]
struct CollaborationError {
    code: &'static str,
    status: u16,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    conflict: Option<lib_command_replay::ReplayConflict>,
}

pub fn replay_error(error: ReplayError) -> Response {
    match error {
        ReplayError::Conflict(conflict) => {
            let message = conflict.reason.clone();
            collaboration_error(
                StatusCode::CONFLICT,
                "CollaborationConflict",
                &message,
                Some(conflict),
            )
        }
        ReplayError::UnsupportedProtocol(version) => collaboration_error(
            StatusCode::UPGRADE_REQUIRED,
            "ClientUpgradeRequired",
            &format!("unsupported collaboration protocol version {version}"),
            None,
        ),
        other => collaboration_error(
            StatusCode::BAD_REQUEST,
            "InvalidCollaborationBatch",
            &other.to_string(),
            None,
        ),
    }
}

pub fn collaboration_error(
    status: StatusCode,
    code: &'static str,
    message: &str,
    conflict: Option<lib_command_replay::ReplayConflict>,
) -> Response {
    (
        status,
        Json(CollaborationError {
            code,
            status: status.as_u16(),
            message: message.into(),
            conflict,
        }),
    )
        .into_response()
}

pub fn internal_error(error: impl std::fmt::Display) -> Response {
    ApiError::internal_error().message(error).into_response()
}
