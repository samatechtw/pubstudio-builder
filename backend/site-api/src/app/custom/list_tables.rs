use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::{
    custom_data_dto::ListTables, custom_metadata_viewmodel::CustomMetadata,
};
use serde_json::Value;

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
    data: Value,
) -> Result<Vec<CustomMetadata>, ApiError> {
    let dto: ListTables = parse_request_data(data)?;

    Ok(vec![CustomMetadata {
        id: "1".to_string(),
        name: "custom_table".to_string(),
        columns: "".to_string(),
    }])
}
