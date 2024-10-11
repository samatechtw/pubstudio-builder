use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
};
use lib_shared_types::{
    dto::custom_data::{
        custom_data_info_viewmodel::{to_api_response, CustomDataInfoViewModel},
        update_table_dto::UpdateTable,
    },
    entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity,
    error::api_error::ApiErrorCode,
};
use serde_json::Value;
use validator::Validate;

use crate::api_context::ApiContext;

use super::{
    custom_data::parse_request_data,
    helpers::{validate_table_available, validate_table_name},
};

fn map_rename_table_error(e: DbError) -> ApiError {
    ApiError::internal_error().message(format!("Failed to rename table: {}", e))
}

/*
{
  "action": "UpdateTable",
  "data": {
    "table_name": "custom_table",
    "events": [{
      "event_type": "EmailRow",
      "trigger": "AddRow",
      "options": {
        "recipients": ["test@test.com"]
      }
    ]
  }
}
*/
pub async fn update_table(
    context: &ApiContext,
    site_id: &String,
    data: Value,
) -> Result<CustomDataInfoViewModel, ApiError> {
    let dto: UpdateTable = parse_request_data(data.clone())?;
    check_bad_form(dto.validate())?;
    validate_table_name(&dto.old_name)?;
    let mut entity_opt: Option<CustomDataInfoEntity> = None;

    // Rename table
    let table_name = if let Some(new_name) = dto.new_name {
        // Validate new table name
        validate_table_name(&new_name)?;
        validate_table_available(context, site_id, &new_name).await?;

        // Update table name and info in transaction
        let mut tx = context
            .custom_data_repo
            .start_transaction(site_id)
            .await
            .map_err(map_rename_table_error)?;

        context
            .custom_data_repo
            .rename_table(&mut tx, &dto.old_name, &new_name)
            .await
            .map_err(map_rename_table_error)?;

        let res = context
            .custom_data_info_repo
            .update_table_name(&mut tx, &dto.old_name, &new_name)
            .await
            .map_err(map_rename_table_error)?;
        entity_opt = Some(res);

        tx.commit().await.map_err(|e| {
            ApiError::internal_error().message(format!("Failed to rename table: {}", e))
        })?;
        new_name
    } else {
        dto.old_name
    };
    println!("SETTING EVENTS {:?}", dto.events);

    if dto.events.is_some() {
        // Update table events
        let entity = context
            .custom_data_info_repo
            .update_events(site_id, &table_name, data["events"].clone())
            .await
            .map_err(|e| ApiError::internal_error().message(e))?;
        entity_opt = Some(entity)
    }

    if let Some(entity) = entity_opt {
        Ok(to_api_response(entity))
    } else {
        Err(ApiError::bad_request().code(ApiErrorCode::NoUpdates))
    }
}
