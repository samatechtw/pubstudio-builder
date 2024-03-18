use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::remove_column_dto::RemoveColumn;
use serde_json::Value;
use validator::Validate;

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
pub async fn remove_column(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<(), ApiError> {
    let dto: RemoveColumn = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    println!("removed column name: {:?}", dto.column_name);

    Ok(())
}
