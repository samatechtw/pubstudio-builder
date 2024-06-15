use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    custom_data_info_viewmodel::{to_api_response, CustomDataInfoViewModel},
    remove_column_dto::RemoveColumn,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{get_column_info, save_column_info, validate_column_name, validate_table_name},
};

/*
{
  "action": "RemoveColumn",
  "data": {
    "table_name": "contact_form",
    "column_name": "message"
  }
}
*/
pub async fn remove_column(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CustomDataInfoViewModel, ApiError> {
    let dto: RemoveColumn = parse_request_data(data)?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.table_name)?;
    validate_column_name(&dto.column_name)?;

    let table = &dto.table_name.clone();
    let column_to_remove = dto.column_name.clone();

    context
        .custom_data_repo
        .remove_column(site_id, &dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Update columns in custom_data_info table
    let mut original_columns = get_column_info(context, site_id, table).await?;
    original_columns.remove(&column_to_remove);

    let result = save_column_info(context, site_id, table, original_columns).await?;

    Ok(to_api_response(result))
}
