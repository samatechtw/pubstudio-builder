use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::AddRow;
use serde_json::Value;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "AddRow",
  "data": {
    "table_name": "custom_table",
    "values": {
      "name": "John",
      "age": "30"
    }
  }
}
*/
pub async fn add_row(context: &ApiContext, data: Value) -> Result<(), ApiError> {
    let dto: AddRow = parse_request_data(data)?;

    for (k, v) in &dto.values {
        println!("key: {}, value: {}", k, v);
    }

    Ok(())
}