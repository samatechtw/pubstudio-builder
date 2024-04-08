use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::add_row_dto::AddRow;
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{custom_data::parse_request_data, helpers::validate_row_data};

/*
{
  "action": "AddRow",
  "data": {
    "table_name": "contact_form",
    "row": {
      "name": "John",
      "age": "30",
      "email": "john_test@abc.com"
    }
  }
}
*/
pub async fn add_row(context: &ApiContext, site_id: &String, data: Value) -> Result<(), ApiError> {
    let dto: AddRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    // Validate data by checking columns in custom_data_info
    validate_row_data(context, site_id, &dto.table_name, &dto.row).await?;

    context
        .custom_data_repo
        .add_row(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}
