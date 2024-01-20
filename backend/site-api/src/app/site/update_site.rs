use axum::{
    extract::{Path, State},
    http::StatusCode,
    Extension, Json,
};
use chrono::{DateTime, Utc};
use lib_shared_site_api::{
    db::db_error::DbError,
    error::{api_error::ApiError, helpers::check_bad_form},
    util::json_extractor::PsJson,
    validator::site_data_len_validator::SiteDataValidator,
};
use lib_shared_types::{
    dto::site_api::{
        site_viewmodel::{to_api_response, SiteViewModel},
        update_site_dto::{UpdateSiteDto, UpdateSiteDtoWithContentUpdatedAt},
    },
    error::api_error::ApiErrorCode,
    shared::user::{RequestUser, UserType},
};
use validator::Validate;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn update_site(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<UpdateSiteDto>,
) -> Result<(StatusCode, Json<SiteViewModel>), ApiError> {
    check_bad_form(dto.validate())?;
    verify_site_owner(&context, &user, &id).await?;

    let site_metadata = context
        .metadata_repo
        .get_site_metadata(&id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    let site_type = site_metadata.site_type;
    if site_metadata.disabled
        && user.user_type != UserType::Admin
        && user.user_type != UserType::Cron
    {
        return Err(ApiError::forbidden());
    }

    // Validate
    let validator = SiteDataValidator::new(site_type);
    if let Some(value) = &dto.context {
        validator.validate_context(value)?;
    }
    if let Some(value) = &dto.history {
        validator.validate_history(value)?;
    }
    if let Some(value) = &dto.pages {
        validator.validate_pages(value)?;
    }
    let has_update_key = dto.update_key.is_some();

    let site = context
        .site_repo
        .get_site_latest_version(&id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Update `content_updated_at` if any of `defaults`, `context`, or `pages` changes.
    let mut content_updated_at: Option<DateTime<Utc>> = None;

    let new_defaults = dto.defaults.clone();
    let new_context = dto.context.clone();
    let new_pages = dto.pages.clone();

    if let (Some(defaults), Some(context), Some(pages)) = (new_defaults, new_context, new_pages) {
        if site.defaults != defaults.to_string()
            || site.context != context.to_string()
            || site.pages != pages
        {
            content_updated_at = Some(Utc::now());
        }
    }

    let site = context
        .site_repo
        .update_site(
            &id,
            UpdateSiteDtoWithContentUpdatedAt {
                dto,
                content_updated_at,
            },
        )
        .await
        .map_err(|e| match e {
            DbError::NoUpdate => ApiError::bad_request()
                .code(ApiErrorCode::NoUpdates)
                .message("No updates were made for the request.".to_string()),
            DbError::EntityNotFound() => {
                if has_update_key {
                    ApiError::bad_request()
                        .code(ApiErrorCode::UpdateStale)
                        .message("update_key did not match")
                } else {
                    ApiError::not_found()
                }
            }
            DbError::Query(e) => ApiError::bad_request()
                .message("Error occurred during the database query: ".to_string() + &e),
            _ => ApiError::internal_error().message(e),
        })?;

    // Update in-memory cache
    context
        .cache
        .create_or_update_cache(&id, site.calculate_site_size(), site_type)
        .await;

    Ok((StatusCode::OK, Json(to_api_response(site))))
}
