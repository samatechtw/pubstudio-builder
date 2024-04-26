use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    create_table_dto::{CreateTable, CreateTableResponse},
    custom_data_info_dto::CustomDataInfoDto,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{validate_column_names, validate_table_name},
};

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
    Ok(create_custom_table_helper(context, site_id, data).await?)
}

pub async fn create_custom_table_helper(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CreateTableResponse, ApiError> {
    let dto: CreateTable = parse_request_data(data.clone())?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.table_name)?;
    validate_column_names(dto.columns.keys())?;

    let metadata_dto = CustomDataInfoDto {
        name: dto.table_name.clone(),
        columns: data["columns"].clone(),
        events: data["events"].clone(),
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

    Ok(CreateTableResponse {
        name: result.name,
        id: result.id.to_string(),
    })
}
