use std::collections::HashMap;

use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::custom_data::create_table_dto::{ColumnInfo, RuleType},
    error::api_error::ApiErrorCode,
    type_util::is_email,
};

use crate::api_context::ApiContext;

pub async fn validate_row_data(
    context: &ApiContext,
    site_id: &String,
    table: &String,
    values: &HashMap<String, String>,
) -> Result<(), ApiError> {
    let columns = context
        .custom_data_info_repo
        .get_columns_from_table(site_id, table)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let column_info = parse_column_info(&columns)?;

    for (k, info) in column_info {
        for rule in info.validation_rules.iter() {
            match rule.rule_type {
                RuleType::Email => {
                    if let Some(v) = values.get(&k) {
                        if !is_email(v) {
                            return Err(ApiError::bad_request()
                                .code(ApiErrorCode::CustomColumnValidationFail)
                                .message(format!("{} is not a valid email", v)));
                        }
                    }
                }
                _ => {}
            }
        }
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
