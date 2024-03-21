use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::{
    dto::custom_data::{
        create_table_dto::{CreateTable, CreateTableResponse},
        custom_data_info_dto::CustomDataInfoDto,
    },
    error::api_error::ApiErrorCode,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "CreateTable",
  "data": {
    "table_name": "custom_table",
    "columns": {
      "name": {
        "data_type": "TEXT",
        "validation_rules": [
            {
                "rule_type": "Unique"
            }
        ]
      },
      "phone": {
        "data_type": "TEXT",
        "validation_rules": [
            {
                "rule_type": "MinLength",
                "parameter": 1
            },
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
pub async fn create_table(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CreateTableResponse, ApiError> {
    let id: String = create_custom_table_helper(context, site_id, data).await?;

    Ok(CreateTableResponse { id })
}

pub async fn create_custom_table_helper(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<String, ApiError> {
    let dto: CreateTable = parse_request_data(data.clone())?;
    check_bad_form(dto.validate())?;

    if dto.table_name == "site_versions" || dto.table_name == "custom_data_info" {
        return Err(ApiError::bad_request()
            .code(ApiErrorCode::CustomTableNameExists)
            .message("table_name cannot be site_versions or custom_data_info".to_string()));
    }

    let metadata_dto = CustomDataInfoDto {
        name: dto.table_name.clone(),
        columns: data["columns"].clone(),
    };

    context
        .custom_data_repo
        .create_table(site_id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Add entry to custom_data_info
    let result = context
        .custom_data_info_repo
        .add_info(site_id, metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(result.id.to_string())
}
