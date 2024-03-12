use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::RemoveColumn;
use serde_json::Value;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "RemoveColumn",
  "data": {
    "table_name": "custom_table",
    "column_name": "age"
  }
}
*/
pub async fn remove_column(context: &ApiContext, data: Value) -> Result<(), ApiError> {
    let dto: RemoveColumn = parse_request_data(data)?;

    println!("removed column name: {:?}", dto.column_name);

    Ok(())
}
