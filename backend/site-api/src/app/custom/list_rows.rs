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
    "table_name": "contact_form",
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
    let query: ListRowsQuery = parse_request_data(data)?;
    check_bad_form(query.validate())?;

    let rows = context
        .custom_data_repo
        .list_rows(site_id, query)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(rows)
}
