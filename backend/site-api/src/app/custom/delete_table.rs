use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::delete_table_dto::DeleteTable;
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{custom_data::parse_request_data, helpers::validate_table_name};

/*
{
  "action": "DeleteTable",
  "data": {
    "table_name": "custom_table"
  }
}
*/
pub async fn delete_table(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<(), ApiError> {
    let dto: DeleteTable = parse_request_data(data.clone())?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.table_name)?;

    context
        .custom_data_repo
        .delete_table(site_id, &dto.table_name)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Remove entry from custom_data_info
    context
        .custom_data_info_repo
        .remove_info(site_id, &dto.table_name)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}
