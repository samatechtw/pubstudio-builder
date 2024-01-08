use lib_shared_types::{
    constants::{KB, MB},
    error::api_error::ApiErrorCode,
    shared::site::SiteType,
};

use crate::error::api_error::ApiError;

pub struct SiteDataValidator {
    max_context_length: u64,
    max_history_length: u64,
    max_pages_length: u64,
}

impl SiteDataValidator {
    pub fn new(site_type: SiteType) -> Self {
        // TODO: Determine max_length based on site_type
        Self {
            max_context_length: 100 * KB,
            max_history_length: 100 * KB,
            max_pages_length: 1 * MB,
        }
    }

    pub fn validate_context(&self, context: &serde_json::Value) -> Result<(), ApiError> {
        self.validate_field_length(
            context,
            self.max_context_length,
            "Context length exceeds limit",
        )?;

        Ok(())
    }

    pub fn validate_history(&self, history: &serde_json::Value) -> Result<(), ApiError> {
        self.validate_field_length(
            history,
            self.max_history_length,
            "History length exceeds limit",
        )?;

        Ok(())
    }

    pub fn validate_pages(&self, pages: &serde_json::Value) -> Result<(), ApiError> {
        self.validate_field_length(pages, self.max_pages_length, "Site data exceeds limit")?;
        Ok(())
    }

    fn validate_field_length(
        &self,
        value: &serde_json::Value,
        max_length: u64,
        error_message: &str,
    ) -> Result<(), ApiError> {
        let json_length: u64 = serde_json::to_string(value)
            .map_err(|e| ApiError::bad_request().message(e))?
            .len()
            .try_into()
            .map_err(|_| ApiError::internal_error().message("Conversion error"))?;

        if json_length > max_length {
            return Err(ApiError::bad_request()
                .code(ApiErrorCode::SiteDataLenExceeded)
                .message(error_message));
        }
        Ok(())
    }
}
