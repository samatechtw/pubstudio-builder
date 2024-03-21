use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension, Json,
};
use lib_shared_site_api::{
    error::{api_error::ApiError, helpers::check_bad_form},
    util::json_extractor::PsJson,
};
use lib_shared_types::{
    dto::custom_data::custom_data_dto::{Action, CustomDataDto},
    shared::user::{RequestUser, UserType},
};
use serde::de::DeserializeOwned;

use validator::Validate;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

use super::{
    add_column::add_column, add_row::add_row, create_table::create_table, list_rows::list_rows,
    list_tables::list_tables, modify_column::modify_column, remove_column::remove_column,
    update_row::update_row,
};

pub fn parse_request_data<T: DeserializeOwned>(data: serde_json::Value) -> Result<T, ApiError> {
    serde_json::from_value(data)
        .map_err(|_| ApiError::internal_error().message("Failed to parse request data"))
}

pub async fn custom_data(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<CustomDataDto>,
) -> Result<(StatusCode, Response), ApiError> {
    check_bad_form(dto.validate())?;
    if dto.action != Action::AddRow && user.user_type == UserType::Anonymous {
        return Err(ApiError::forbidden());
    }
    if dto.action != Action::AddRow {
        verify_site_owner(&context, &user, &id).await?;
    }

    return match dto.action {
        Action::CreateTable => {
            let response = create_table(&context, &id, dto.data).await?;

            Ok((StatusCode::CREATED, Json(response).into_response()))
        }
        Action::AddRow => {
            add_row(&context, &id, dto.data).await?;

            Ok((
                StatusCode::NO_CONTENT,
                StatusCode::NO_CONTENT.into_response(),
            ))
        }
        Action::ListTables => {
            let response = list_tables(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::ListRows => {
            let response = list_rows(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::UpdateRow => {
            let response = update_row(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::AddColumn => {
            let response = add_column(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::RemoveColumn => {
            remove_column(&context, &id, dto.data).await?;

            Ok((
                StatusCode::NO_CONTENT,
                StatusCode::NO_CONTENT.into_response(),
            ))
        }
        Action::ModifyColumn => {
            let response = modify_column(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
    };
}
