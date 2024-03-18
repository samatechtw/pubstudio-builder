use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::list_rows_query::{ListRowsQuery, ListRowsResponse};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "ListRows",
  "data": {
    "table_name": "custom_table",
    "from": 1,
    "to": 10
  }
}
*/
pub async fn list_rows(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<ListRowsResponse, ApiError> {
    let dto: ListRowsQuery = parse_request_data(data)?;
    check_bad_form(dto.validate())?;

    println!("table_name: {}", dto.table_name);

    Ok(ListRowsResponse {
        total: 0,
        results: vec![],
    })
}
