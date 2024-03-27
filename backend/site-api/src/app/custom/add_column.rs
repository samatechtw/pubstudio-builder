use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    add_column_dto::AddColumn,
    custom_data_info_dto::CustomDataInfoDto,
    custom_data_info_viewmodel::{to_api_response, CustomDataInfoViewModel},
};
use serde_json::Value;
use validator::Validate;

use crate::{api_context::ApiContext, app::custom::helpers::parse_column_info};

use super::custom_data::parse_request_data;

/*
{
  "action": "AddColumn",
  "data": {
    "table_name": "contact_form",
    "column": {
        "phone": {
            "data_type": "TEXT",
            "validation_rules": [
                {
                    "rule_type": "MaxLength",
                    "parameter": 10
                }
            ]
        }
    }
  }
}
*/
pub async fn add_column(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CustomDataInfoViewModel, ApiError> {
    let dto: AddColumn = parse_request_data(data.clone())?;
    check_bad_form(dto.validate())?;

    let table = &dto.table_name.clone();
    let new_column = dto.column.clone();

    context
        .custom_data_repo
        .add_column(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Update columns in custom_data_info table
    let original_columns = context
        .custom_data_info_repo
        .get_columns_from_table(site_id, table)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let mut original_columns_map = parse_column_info(&original_columns)?;
    original_columns_map.extend(new_column);

    let column_value: Value = serde_json::to_value(original_columns_map).map_err(|e| {
        ApiError::internal_error().message(format!("Failed to convert HashMap to JSON: {}", e))
    })?;

    let metadata_dto = CustomDataInfoDto {
        name: table.to_string(),
        columns: column_value,
    };

    let result = context
        .custom_data_info_repo
        .update_info(site_id, metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(to_api_response(result))
}
