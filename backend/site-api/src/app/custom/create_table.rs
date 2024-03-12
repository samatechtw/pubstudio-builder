use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::{CreateTable, CreateTableResponse};
use serde_json::Value;

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
                "rule_type": "Unique",
                "parameters": null
            }
        ]
      },
      "age": {
        "data_type": "TEXT",
        "validation_rules": [
            {
                "rule_type": "Unique",
                "parameters": null
            }
        ]
      }
    }
  }
}
*/
pub async fn create_table(
    context: &ApiContext,
    data: Value,
) -> Result<CreateTableResponse, ApiError> {
    let dto: CreateTable = parse_request_data(data)?;

    for (k, v) in &dto.columns {
        println!("key: {}, column info: {:?}", k, v);
    }

    Ok(CreateTableResponse {
        id: "1".to_string(),
    })
}
