use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::{AddColumn, UpdateColumnResponse};
use serde_json::{json, Value};

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "AddColumn",
  "data": {
    "table_name": "custom_table",
    "column": {
        "phone": {
            "data_type": "TEXT",
            "validation_rules": [
                {
                    "rule_type": "MinLength",
                    "parameters": 1
                },
                {
                    "rule_type": "MaxLength",
                    "parameters": 10
                }
            ]
        }
    }
  }
}
*/
pub async fn add_column(
    context: &ApiContext,
    data: Value,
) -> Result<UpdateColumnResponse, ApiError> {
    let dto: AddColumn = parse_request_data(data)?;

    for (k, v) in &dto.column {
        println!("added key: {}, info: {:?}", k, v);
    }

    Ok(UpdateColumnResponse {
        updated_column: json!({}),
    })
}
