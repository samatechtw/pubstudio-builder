use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::update_row_dto::{UpdateRow, UpdateRowResponse};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{validate_column_names, validate_table_name},
    validate_row_data::validate_row_data,
};

/*
{
  "action": "UpdateRow",
  "data": {
    "table_name": "contact_form",
    "row_id": 1,
    "new_row": {
        "age": "36"
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

    // Validate data by checking columns in custom_data_info
    validate_row_data(context, site_id, &dto.table_name, &dto.new_row).await?;

    let updated_row = context
        .custom_data_repo
        .update_row(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(UpdateRowResponse { updated_row })
}
