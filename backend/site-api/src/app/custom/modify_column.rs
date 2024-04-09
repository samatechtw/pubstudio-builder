use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::{
    dto::custom_data::{
        custom_data_info_viewmodel::{to_api_response, CustomDataInfoViewModel},
        modify_column_dto::ModifyColumn,
    },
    error::api_error::ApiErrorCode,
};
use serde_json::Value;
use validator::Validate;

use crate::{
    api_context::ApiContext,
    app::custom::helpers::{get_column_info, save_column_info},
};

use super::custom_data::parse_request_data;

/*
{
  "action": "ModifyColumn",
  "data": {
    "table_name": "custom_table",
    "old_column_name": "phone",
    "new_column_name": "phone_number"
  }
}
*/
pub async fn modify_column(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CustomDataInfoViewModel, ApiError> {
    let dto: ModifyColumn = parse_request_data(data)?;
    check_bad_form(dto.validate())?;
    if dto.new_column_name.is_none() && dto.new_column_info.is_none() {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message("Must provide new column name or info"));
    }

    let table = dto.table_name.clone();
    let old_column = dto.old_column_name.clone();
    let new_column = dto.new_column_name.clone();

    if let Some(new_column_name) = dto.new_column_name {
        context
            .custom_data_repo
            .modify_column(site_id, &table, &old_column, &new_column_name)
            .await
            .map_err(|e| ApiError::internal_error().message(e))?;
    }

    let mut column_info = get_column_info(context, site_id, &table).await?;
    let old_info = column_info
        .remove(&old_column)
        .ok_or(ApiError::internal_error().message(format!("No column with name {}", old_column)))?;

    let new_info = dto.new_column_info.unwrap_or(old_info);
    column_info.insert(new_column.unwrap_or(old_column), new_info);

    let result = save_column_info(context, site_id, &table, column_info).await?;

    Ok(to_api_response(result))
}
