use axum::{
    extract::rejection::JsonRejection::{self, JsonDataError, JsonSyntaxError},
    http::StatusCode,
};
use axum_macros::FromRequest;
use lib_shared_types::error::api_error::ApiErrorCode;
use regex::Regex;

use crate::error::api_error::ApiError;

// Create a custom extractor based on `axum::Json` with a custom rejection
#[derive(FromRequest)]
#[from_request(via(axum::Json), rejection(ApiError))]
pub struct PsJson<T>(pub T);

fn field_from_error(err: &str) -> Option<String> {
    if let Ok(regex) = Regex::new(r"missing field `([a-zA-Z0-9]+)`.*") {
        if let Some(captures) = regex.captures(err) {
            return Some(captures[1].to_string());
        }
    }
    None
}

// Implement `From<JsonRejection> for ApiError`
impl From<JsonRejection> for ApiError {
    fn from(rejection: JsonRejection) -> Self {
        let message = match rejection {
            JsonDataError(e) => {
                let err_str = e.to_string();
                if let Some(field) = field_from_error(&e.body_text()) {
                    format!("missing field {}", field)
                } else {
                    err_str
                }
            }
            JsonSyntaxError(ref e) => {
                println!(
                    "JsonSyntaxError: {}, {}, {}",
                    rejection.status(),
                    rejection.to_string(),
                    e.to_string(),
                );
                rejection.body_text()
            }
            _ => rejection.body_text(),
        };
        Self {
            status: StatusCode::BAD_REQUEST,
            message,
            code: ApiErrorCode::InvalidFormData,
        }
    }
}
