use axum::{
    extract::rejection::JsonRejection::{self, JsonDataError, JsonSyntaxError},
    http::StatusCode,
};
use axum_macros::FromRequest;
use lib_shared_types::error::api_error::ApiErrorCode;
use regex::Regex;
use std::error::Error;

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
                } else if let Some(err) =
                    find_error_source::<serde_path_to_error::Error<serde_json::Error>>(&e)
                {
                    // TODO -- more specific error handling
                    let serde_json_err = err.inner().to_string();
                    let is_line = serde_json_err.find(" at ");
                    if let Some(line_loc) = is_line {
                        serde_json_err[0..line_loc].to_string()
                    } else {
                        serde_json_err
                    }
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

// attempt to downcast `err` into a `T` and if that fails recursively try and
// downcast `err`'s source
fn find_error_source<'a, T>(err: &'a (dyn Error + 'static)) -> Option<&'a T>
where
    T: Error + 'static,
{
    if let Some(err) = err.downcast_ref::<T>() {
        Some(err)
    } else if let Some(source) = err.source() {
        find_error_source(source)
    } else {
        None
    }
}
