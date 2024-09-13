use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
};
use lib_shared_types::{
    dto::custom_data::add_row_dto::{AddRow, AddRowResponse},
    error::api_error::ApiErrorCode,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{
        parse_event_info, validate_column_names, validate_custom_data_allowance,
        validate_table_name,
    },
    trigger_table_events::trigger_add_row,
    validate_row_data::validate_row_data,
};

/*
{
  "action": "AddRow",
  "data": {
    "table_name": "contact_form",
    "row": {
      "name": "John",
      "message": "Hello there!",
      "email": "john_test@abc.com"
    }
  }
}
*/
pub async fn add_row(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<AddRowResponse, ApiError> {
    let dto: AddRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.table_name)?;
    validate_column_names(dto.row.keys())?;

    // Check if site's custom_data_allowance is already exceeded
    validate_custom_data_allowance(context, site_id).await?;

    // Validate data by checking columns in custom_data_info
    let table = validate_row_data(context, site_id, &dto.table_name, None, &dto.row).await?;

    // Save row to database
    let row = context
        .custom_data_repo
        .add_row(site_id, dto)
        .await
        .map_err(|e| match e {
            DbError::EntityNotFound() => {
                ApiError::bad_request().code(ApiErrorCode::CustomTableNotFound)
            }
            _ => ApiError::internal_error().message(e),
        })?;
    let id = row
        .get("id")
        .map(|id| id.to_string())
        .unwrap_or("error".to_string());

    // Trigger AddRow table events
    let events = parse_event_info(&table.events)?;
    let triggered = trigger_add_row(context, &table.name, events, row).await?;

    Ok(AddRowResponse {
        id,
        events: triggered,
    })
}
