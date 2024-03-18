use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::add_column_dto::{AddColumn, UpdateColumnResponse};
use serde_json::{json, Value};
use validator::Validate;

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
pub async fn add_column(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<UpdateColumnResponse, ApiError> {
    let dto: AddColumn = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    for (k, v) in &dto.column {
        println!("added key: {}, info: {:?}", k, v);
    }

    Ok(UpdateColumnResponse {
        updated_column: json!({}),
    })
}
