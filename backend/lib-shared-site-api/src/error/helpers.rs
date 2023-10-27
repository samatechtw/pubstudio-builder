use super::api_error::ApiError;

use lib_shared_types::error::api_error::ApiErrorCode;
use regex::Regex;
use validator::ValidationErrors;

pub fn check_bad_form<T>(result: Result<T, ValidationErrors>) -> Result<T, ApiError> {
    result.map_err(|_| ApiError::bad_request().code(ApiErrorCode::InvalidFormData))
}

/// Validates that a string contains only digits
pub fn validate_integer(str: &str) -> Result<(), ApiError> {
    if !str.chars().all(|c| c.is_digit(10)) {
        return Err(ApiError::bad_request().code(ApiErrorCode::InvalidFormData));
    }
    Ok(())
}

pub fn validate_subdomain(subdomain: &str, is_admin: bool) -> Result<(), ApiError> {
    // Validate if it contains only lowercase characters, numbers, and dashes, and starts with a lowercase character
    validate_domain(subdomain).map_err(|e| {
        ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message(format!("{} {}", "Subdomain", e.to_string()))
    })?;

    // Validate if it conflicts with reserved subdomains
    let reserved_subdomains = [
        "www",
        "app",
        "admin",
        "stg",
        "demo",
        "site-assets",
        "site-backups",
        "api",
    ];
    if reserved_subdomains.iter().any(|&r| subdomain.contains(r)) {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message("Subdomain conflicts with reserved subdomains"));
    }
    if !is_admin && subdomain == "blog" {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message("Only admin allowed to create the blog subdomain"));
    }

    // Validate if it meets the restriction of "s<N>" format
    if subdomain.starts_with('s') {
        if let Some(n) = subdomain.chars().nth(1) {
            if n.is_ascii_digit() {
                return Err(ApiError::bad_request()
                    .code(ApiErrorCode::InvalidFormData)
                    .message("Subdomain conflicts with reserved subdomains"));
            }
        }
    }

    Ok(())
}

pub fn validate_custom_domains(custom_domains: &Vec<String>) -> Result<(), ApiError> {
    for domain in custom_domains {
        let domain_without_dot = domain.replace('.', "");
        validate_domain(&domain_without_dot).map_err(|e| {
            ApiError::bad_request()
                .code(ApiErrorCode::InvalidFormData)
                .message(format!("{} {}", "Custom domains", e.to_string()))
        })?;
    }
    Ok(())
}

fn validate_domain(value: &str) -> Result<(), &str> {
    let pattern = Regex::new(r"^[a-z][a-z0-9-]*$").unwrap();

    if pattern.is_match(value) {
        Ok(())
    } else {
        Err("can only contain lowercase characters, numbers, and dashes")
    }
}
