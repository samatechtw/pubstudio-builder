use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::{ModifyColumn, UpdateColumnResponse};
use serde_json::{json, Value};

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

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
    data: Value,
) -> Result<UpdateColumnResponse, ApiError> {
    let dto: ModifyColumn = parse_request_data(data)?;

    println!(
        "modified column name from {} to {}",
        dto.old_column_name, dto.new_column_name
    );

    Ok(UpdateColumnResponse {
        updated_column: json!({}),
    })
}
