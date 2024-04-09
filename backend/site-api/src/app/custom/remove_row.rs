use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::remove_row_dto::RemoveRow;
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "AddRow",
  "data": {
    "table_name": "contact_form",
    "row_id": 1
  }
}
*/
pub async fn remove_row(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<(), ApiError> {
    let dto: RemoveRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    context
        .custom_data_repo
        .remove_row(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}
