use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
};
use lib_shared_types::{
    dto::custom_data::{
        update_row_dto::{UpdateRow, UpdateRowResponse},
        CustomDataRow,
    },
    error::api_error::ApiErrorCode,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{parse_event_info, validate_column_names, validate_table_name},
    trigger_table_events::trigger_update_row,
    validate_row_data::validate_row_data,
};

async fn validate_changes(
    context: &ApiContext,
    site_id: &str,
    dto: &UpdateRow,
) -> Result<CustomDataRow, ApiError> {
    let row_opt = context
        .custom_data_repo
        .get_row_by_id(site_id, &dto.table_name, dto.row_id)
        .await
        .map_err(|e| match e {
            DbError::EntityNotFound() => {
                ApiError::bad_request().code(ApiErrorCode::CustomDataRowNotFound)
            }
            _ => ApiError::internal_error().message(e),
        })?;
    if let Some(row) = row_opt {
        let mut changed = false;
        for (k, v) in dto.new_row.iter() {
            if let Some(old_val) = row.get(k) {
                if v != old_val {
                    changed = true;
                    break;
                }
            }
        }
        if changed {
            Ok(row)
        } else {
            Err(ApiError::bad_request().code(ApiErrorCode::NoUpdates))
        }
    } else {
        Err(ApiError::bad_request().code(ApiErrorCode::CustomDataRowNotFound))
    }
}

/*
{
  "action": "UpdateRow",
  "data": {
    "table_name": "contact_form",
    "row_id": 1,
    "new_row": {
        "message": "Test"
    }
  }
}
*/
pub async fn update_row(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<UpdateRowResponse, ApiError> {
    let dto: UpdateRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.table_name)?;
    validate_column_names(dto.new_row.keys())?;

    // Disregard if there was no change
    let old_row = validate_changes(context, site_id, &dto).await?;

    // Validate data by checking columns in custom_data_info
    let table = validate_row_data(
        context,
        site_id,
        &dto.table_name,
        Some(dto.row_id),
        &dto.new_row,
    )
    .await?;

    let updated_row = context
        .custom_data_repo
        .update_row(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let events = parse_event_info(&table.events)?;
    let triggered =
        trigger_update_row(context, &table.name, events, &old_row, &updated_row).await?;

    Ok(UpdateRowResponse {
        updated_row,
        events: triggered,
    })
}
