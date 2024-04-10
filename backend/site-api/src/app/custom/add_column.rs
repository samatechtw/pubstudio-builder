use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    add_column_dto::AddColumn,
    custom_data_info_viewmodel::{to_api_response, CustomDataInfoViewModel},
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{get_column_info, save_column_info, validate_column_names, validate_table_name},
};

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
    validate_table_name(&dto.table_name)?;
    validate_column_names(dto.column.keys())?;

    let table = &dto.table_name.clone();
    let new_column = dto.column.clone();

    context
        .custom_data_repo
        .add_column(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Update columns in custom_data_info table
    let mut original_columns = get_column_info(context, site_id, table).await?;
    original_columns.extend(new_column);

    let result = save_column_info(context, site_id, table, original_columns).await?;

    Ok(to_api_response(result))
}
