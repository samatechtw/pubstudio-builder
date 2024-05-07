use std::collections::HashMap;

use lib_shared_site_api::{db::db_error::DbError, error::api_error::ApiError};
use lib_shared_types::{
    dto::custom_data::{
        create_table_dto::ColumnInfo, custom_data_info_dto::CustomDataUpdateColumns,
        custom_event_dto::EventInfo,
    },
    entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity,
    error::api_error::ApiErrorCode,
    type_util::REGEX_TABLE_NAME,
};
use serde_json::Value;

use crate::api_context::ApiContext;

pub fn validate_table_name(table: &str) -> Result<(), ApiError> {
    if !REGEX_TABLE_NAME.is_match(table)
        || table == "site_versions"
        || table == "custom_data_info"
        || table.starts_with("sqlite_")
    {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomTableNameInvalid)
            .message("Restricted table name"));
    }

    Ok(())
}

pub async fn validate_table_available(
    context: &ApiContext,
    site_id: &str,
    table: &str,
) -> Result<(), ApiError> {
    let result = context
        .custom_data_info_repo
        .get_table(site_id, table)
        .await;
    let err = match result {
        Ok(_) => ApiError::bad_request()
            .code(ApiErrorCode::CustomTableNameExists)
            .message("Table already exists"),
        Err(e) => match e {
            DbError::SqlxError(sqlx::Error::RowNotFound) => {
                return Ok(());
            }
            _ => ApiError::internal_error().message(format!("Validation error: {:?}", e)),
        },
    };
    Err(err)
}

pub fn validate_column_name(name: &str) -> Result<(), ApiError> {
    if !REGEX_TABLE_NAME.is_match(name) {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomColumnNameInvalid)
            .message(format!("Invalid column name: {}", name)));
    }
    Ok(())
}

pub fn validate_column_names<'a, I>(names: I) -> Result<(), ApiError>
where
    I: IntoIterator<Item = &'a String>,
{
    let bad_name = names.into_iter().find(|name| {
        let key: &str = Into::<&String>::into(*name);
        !REGEX_TABLE_NAME.is_match(key)
    });

    if let Some(name) = bad_name {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomColumnNameInvalid)
            .message(format!("Invalid column name: {}", name)));
    }
    Ok(())
}

pub fn parse_column_info(
    columns: &serde_json::Value,
) -> Result<HashMap<String, ColumnInfo>, ApiError> {
    let column_info_map: HashMap<String, ColumnInfo> = serde_json::from_value(columns.clone())
        .map_err(|e| {
            ApiError::internal_error().message(format!("Failed to deserialize columns: {}", e))
        })?;

    Ok(column_info_map)
}

pub fn parse_event_info(events: &serde_json::Value) -> Result<Vec<EventInfo>, ApiError> {
    let event_info_map: Vec<EventInfo> = serde_json::from_value(events.clone()).map_err(|e| {
        ApiError::internal_error().message(format!("Failed to deserialize events: {}", e))
    })?;

    Ok(event_info_map)
}

pub async fn get_column_info(
    context: &ApiContext,
    site_id: &str,
    table_name: &str,
) -> Result<HashMap<String, ColumnInfo>, ApiError> {
    let table_info = context
        .custom_data_info_repo
        .get_table(site_id, table_name)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(parse_column_info(&table_info.columns)?)
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

    let metadata_dto = CustomDataUpdateColumns {
        name: table_name.to_string(),
        columns: column_value,
    };

    let result = context
        .custom_data_info_repo
        .update_columns(site_id, metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(result)
}
