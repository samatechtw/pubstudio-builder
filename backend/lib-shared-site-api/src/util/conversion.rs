use std::str::FromStr;

use uuid::Uuid;

use crate::error::api_error::ApiError;

pub fn vec_to_string(vec: Vec<String>) -> String {
    return format!("{{{}}}", vec.join(", "));
}

pub fn str_to_uuid(str: &str) -> Result<Uuid, ApiError> {
    Ok(Uuid::from_str(str).map_err(|e| ApiError::internal_error().message(e))?)
}

pub fn str_opt_to_uuid(str: &Option<String>) -> Option<Uuid> {
    str.as_ref().and_then(|s| Uuid::from_str(&s).ok())
}
