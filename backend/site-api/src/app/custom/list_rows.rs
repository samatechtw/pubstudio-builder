use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::custom_data_dto::{ListResponse, ListRows};
use serde_json::Value;

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
pub async fn list_rows(context: &ApiContext, data: Value) -> Result<ListResponse, ApiError> {
    let dto: ListRows = parse_request_data(data)?;

    println!("table_name: {}", dto.table_name);

    Ok(ListResponse {
        total: 0,
        results: vec![],
    })
}
