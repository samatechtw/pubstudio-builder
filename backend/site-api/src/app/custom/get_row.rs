use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::dto::custom_data::{get_row_query::GetRowQuery, CustomDataRow};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{validate_column_name, validate_table_name},
};

/*
{
  "action": "GetRow",
  "data": {
    "table_name": "contact_form",
    "filters": {
      "field_eq": { "field": "name", "value": "May" }
    }
  }
}
*/
pub async fn get_row(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<Option<CustomDataRow>, ApiError> {
    let query: GetRowQuery = parse_request_data(data)?;
    check_bad_form(query.validate())?;
    validate_table_name(&query.table_name)?;
    if let Some(filters) = query.filters.clone() {
        if let Some(field_eq) = filters.field_eq {
            validate_column_name(&field_eq.field)?;
        }
    }

    let rows = context
        .custom_data_repo
        .get_row(site_id, query)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(rows)
}
