use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::add_row_dto::AddRow;
use serde_json::Value;
use validator::Validate;

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
pub async fn add_row(context: &ApiContext, site_id: &String, data: Value) -> Result<(), ApiError> {
    let dto: AddRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    for (k, v) in &dto.values {
        println!("key: {}, value: {}", k, v);
    }

    Ok(())
}
