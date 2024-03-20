use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{
    custom_data_info_viewmodel::to_api_response,
    list_tables_query::{ListTablesQuery, ListTablesResponse},
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::custom_data::parse_request_data;

/*
{
  "action": "ListTables",
  "data": {
    "from": 1,
    "to": 10
  }
}
*/
pub async fn list_tables(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<ListTablesResponse, ApiError> {
    let query: ListTablesQuery = parse_request_data(data)?;
    check_bad_form(query.validate())?;

    let results = context
        .custom_data_info_repo
        .list_tables(site_id, query)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(ListTablesResponse {
        total: results.len(),
        results: results.into_iter().map(|r| to_api_response(r)).collect(),
    })
}
