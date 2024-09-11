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
    add_column::add_column, add_row::add_row, create_table::create_table, get_row::get_row,
    list_rows::list_rows, list_tables::list_tables, modify_column::modify_column,
    remove_column::remove_column, remove_row::remove_row, update_row::update_row,
};

pub fn parse_request_data<T: DeserializeOwned>(data: serde_json::Value) -> Result<T, ApiError> {
    serde_json::from_value(data).map_err(|e| ApiError::bad_request().message(e.to_string()))
}

pub async fn custom_data(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<CustomDataDto>,
) -> Result<(StatusCode, Response), ApiError> {
    check_bad_form(dto.validate())?;
    let allow_anon = matches!(
        dto.action,
        Action::AddRow | Action::UpdateRow | Action::GetRow
    );

    if !allow_anon && user.user_type == UserType::Anonymous {
        return Err(ApiError::forbidden());
    }
    if !allow_anon {
        verify_site_owner(&context, &user, &id).await?;
    }

    return match dto.action {
        Action::CreateTable => {
            let response = create_table(&context, &id, dto.data).await?;

            Ok((StatusCode::CREATED, Json(response).into_response()))
        }
        Action::AddRow => {
            let response = add_row(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::RemoveRow => {
            remove_row(&context, &id, dto.data).await?;

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
        Action::GetRow => {
            let response = get_row(&context, &id, dto.data).await?;

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
            let response = remove_column(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
        Action::ModifyColumn => {
            let response = modify_column(&context, &id, dto.data).await?;

            Ok((StatusCode::OK, Json(response).into_response()))
        }
    };
}
