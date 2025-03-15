use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::{
    dto::custom_data::{
        create_table_dto::ColumnInfo,
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

use super::{
    custom_data::parse_request_data,
    helpers::{map_custom_table_err, validate_column_name, validate_table_name},
};

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
    validate_table_name(&dto.table_name)?;
    validate_column_name(&dto.old_column_name)?;

    if dto.new_column_name.is_none() && dto.new_column_info.is_none() {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::InvalidFormData)
            .message("Must provide new column name or info"));
    }

    let table = dto.table_name.clone();
    let old_column = dto.old_column_name.clone();
    let new_column = dto.new_column_name.clone();

    let mut column_info = get_column_info(context, site_id, &table).await?;

    if let Some(new_column_name) = dto.new_column_name {
        validate_column_name(&new_column_name)?;
        // Avoid duplicate column name
        if column_info.contains_key(&new_column_name) {
            return Err(ApiError::bad_request()
                .code(ApiErrorCode::CustomColumnNameExists)
                .message(format!("Duplicate column name: {}", new_column_name)));
        }

        context
            .custom_data_repo
            .modify_column(site_id, &table, &old_column, &new_column_name)
            .await
            .map_err(map_custom_table_err)?;
    }
    let old_info = column_info
        .remove(&old_column)
        .ok_or(ApiError::internal_error().message(format!("No column with name {}", old_column)))?;

    let column_name = new_column.unwrap_or(old_column);
    let new_info = dto
        .new_column_info
        .and_then(|info| {
            Some(ColumnInfo {
                name: column_name.clone(),
                default: old_info.default.clone(),
                data_type: info.data_type,
                validation_rules: info.validation_rules,
            })
        })
        .unwrap_or(ColumnInfo {
            name: column_name.clone(),
            default: old_info.default,
            data_type: old_info.data_type,
            validation_rules: old_info.validation_rules,
        });
    column_info.insert(column_name, new_info);

    let result = save_column_info(context, site_id, &table, column_info).await?;

    Ok(to_api_response(result))
}
