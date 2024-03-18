use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    add_column_dto::UpdateColumnResponse, modify_column_dto::ModifyColumn,
};
use serde_json::{json, Value};
use validator::Validate;

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
    site_id: &String,
    data: Value,
) -> Result<UpdateColumnResponse, ApiError> {
    let dto: ModifyColumn = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    println!(
        "modified column name from {} to {}",
        dto.old_column_name, dto.new_column_name
    );

    Ok(UpdateColumnResponse {
        updated_column: json!({}),
    })
}
