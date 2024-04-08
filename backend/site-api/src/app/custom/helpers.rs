use std::collections::HashMap;

use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::custom_data::{
        create_table_dto::{ColumnInfo, RuleType},
        custom_data_info_dto::CustomDataInfoDto,
    },
    entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity,
    error::api_error::ApiErrorCode,
    type_util::is_email,
};
use serde_json::Value;

use crate::api_context::ApiContext;

pub async fn validate_row_data(
    context: &ApiContext,
    site_id: &str,
    table: &str,
    values: &HashMap<String, String>,
) -> Result<(), ApiError> {
    let columns = context
        .custom_data_info_repo
        .get_columns_from_table(site_id, table)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let column_info = parse_column_info(&columns)?;

    // Make sure each value is associated with a column
    for k in values.keys() {
        if column_info.get(k).is_none() {
            return Err(ApiError::bad_request()
                .code(ApiErrorCode::CustomDataInvalidColumn)
                .message(format!("Invalid column: {}", k)));
        }
    }

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
                                .message(format!("{} is not a valid email", v)));
                        }
                    }
                }
                RuleType::Required => {
                    if val.is_none() {
                        return Err(ApiError::bad_request().code(ApiErrorCode::CustomDataRequired));
                    }
                }
                RuleType::MinLength => {
                    if let Some(v) = val {
                        let min = rule.parameter.unwrap_or(0) as usize;
                        if v.len() < min {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomDataMinLengthFail)
                                .message(format!("{} length must be greater than {}", k, min)));
                        }
                    }
                }
                RuleType::MaxLength => {
                    if let Some(v) = val {
                        let max = rule.parameter.unwrap_or(0) as usize;
                        if v.len() > max {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomDataMaxLengthFail)
                                .message(format!("{} length must be less than {}", k, max)));
                        }
                    }
                }
                RuleType::Unique => unique_entries.push((k.clone(), val.unwrap_or("").to_string())),
            }
        }
    }
    if unique_entries.len() == 0 {
        return Ok(());
    }
    if !context
        .custom_data_repo
        .verify_unique(site_id, table, unique_entries)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?
    {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomDataUniqueFail)
            .message(format!("Unique constraint violation")));
    }

    Ok(())
}

pub fn parse_column_info(columns: &str) -> Result<HashMap<String, ColumnInfo>, ApiError> {
    let json_value = serde_json::from_str(&columns).map_err(|e| {
        ApiError::internal_error().message(format!("Failed to parse columns str to JSON : {}", e))
    })?;

    let column_info_map: HashMap<String, ColumnInfo> =
        serde_json::from_value(json_value).map_err(|e| {
            ApiError::internal_error().message(format!("Failed to deserialize JSON: {}", e))
        })?;

    Ok(column_info_map)
}

pub async fn get_column_info(
    context: &ApiContext,
    site_id: &str,
    table_name: &str,
) -> Result<HashMap<String, ColumnInfo>, ApiError> {
    let original_columns = context
        .custom_data_info_repo
        .get_columns_from_table(site_id, table_name)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(parse_column_info(&original_columns)?)
}

pub async fn save_column_info(
    context: &ApiContext,
    site_id: &str,
    table_name: &str,
    columns_map: HashMap<String, ColumnInfo>,
) -> Result<CustomDataInfoEntity, ApiError> {
    let column_value: Value = serde_json::to_value(columns_map).map_err(|e| {
        ApiError::internal_error().message(format!("Failed to convert HashMap to JSON: {}", e))
    })?;

    let metadata_dto = CustomDataInfoDto {
        name: table_name.to_string(),
        columns: column_value,
    };

    let result = context
        .custom_data_info_repo
        .update_info(site_id, metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(result)
}
