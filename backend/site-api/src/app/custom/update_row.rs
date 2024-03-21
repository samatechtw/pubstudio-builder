use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::update_row_dto::{UpdateRow, UpdateRowResponse};
use serde_json::{json, Value};
use validator::Validate;

use crate::{api_context::ApiContext, app::custom::helpers::validate_row_data};

use super::custom_data::parse_request_data;

/*
{
  "action": "UpdateRow",
  "data": {
    "table_name": "custom_table",
    "row_id": 123,
    "new_row": {
        "age": "36"
    }
  }
}
*/
pub async fn update_row(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<UpdateRowResponse, ApiError> {
    let dto: UpdateRow = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    // Validate data by checking columns in custom_data_info
    validate_row_data(context, site_id, &dto.table_name, &dto.new_row).await?;

    println!("id: {}", dto.row_id);
    for (k, v) in &dto.new_row {
        println!("updated key: {}, updated value: {}", k, v);
    }

    Ok(UpdateRowResponse {
        updated_row: json!({}),
    })
}
