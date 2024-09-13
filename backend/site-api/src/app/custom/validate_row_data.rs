use std::collections::HashMap;

use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::custom_data::create_table_dto::RuleType,
    entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity,
    error::api_error::ApiErrorCode, type_util::is_email,
};

use crate::api_context::ApiContext;

use super::helpers::parse_column_info;

pub async fn validate_row_data(
    context: &ApiContext,
    site_id: &str,
    table: &str,
    row_id: Option<i32>,
    values: &HashMap<String, String>,
) -> Result<CustomDataInfoEntity, ApiError> {
    let table_entity = context
        .custom_data_info_repo
        .get_table(site_id, table)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let column_info = parse_column_info(&table_entity.columns)?;

    // Make sure each value is associated with a column
    for k in values.keys() {
        if column_info.get(k).is_none() {
            return Err(ApiError::bad_request()
                .code(ApiErrorCode::CustomDataInvalidColumn)
                .message(format!("Invalid column: {}", k)));
        }
    }

    let is_create = row_id.is_none();

    // Check column validation rules
    let mut unique_entries = Vec::<(String, String)>::new();
    for (k, info) in column_info {
        let val = values.get(&k).map(|k| k as &str);

        for rule in info.validation_rules.iter() {
            match rule.rule_type {
                RuleType::Email => {
                    if let Some(v) = val {
                        if !is_email(v) {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomDataInvalidEmail)
                                .message("Invalid email"));
                        }
                    }
                }
                RuleType::Required => {
                    if let Some(v) = val {
                        // Don't allow empty string when creating or updating row
                        if v == "" {
                            return Err(
                                ApiError::bad_request().code(ApiErrorCode::CustomDataRequired)
                            );
                        }
                        // A value is required when creating the row
                    } else if is_create {
                        return Err(ApiError::bad_request().code(ApiErrorCode::CustomDataRequired));
                    }
                }
                RuleType::MinLength => {
                    if let Some(v) = val {
                        let min = rule.parameter.unwrap_or(0) as usize;
                        if v.len() < min {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomDataMinLengthFail)
                                .message(format!("{} must be at least {} characters", k, min)));
                        }
                    }
                }
                RuleType::MaxLength => {
                    if let Some(v) = val {
                        let max = rule.parameter.unwrap_or(0) as usize;
                        if v.len() > max {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomDataMaxLengthFail)
                                .message(format!("{} must be less than {} characters", k, max)));
                        }
                    }
                }
                RuleType::Unique => unique_entries.push((k.clone(), val.unwrap_or("").to_string())),
            }
        }
    }
    if unique_entries.len() == 0 {
        return Ok(table_entity);
    }
    if !context
        .custom_data_repo
        .verify_unique(site_id, table, row_id, unique_entries)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?
    {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomDataUniqueFail)
            .message(format!("Unique constraint violation")));
    }

    Ok(table_entity)
}
