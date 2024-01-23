use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::{api_error::ApiError, helpers::check_bad_form};
use lib_shared_types::{
    dto::site_api::get_site_dto::{to_api_response, GetSiteQuery},
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
    error::api_error::ApiErrorCode,
    shared::user::{RequestUser, UserType},
};
use validator::Validate;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

fn is_admin_or_site_owner(metadata: &SiteMetadataEntity, user: &RequestUser) -> bool {
    match user.user_type {
        UserType::Admin => true,
        UserType::Anonymous => false,
        UserType::Cron => false,
        UserType::Owner => {
            if let Some(user_id) = user.user_id {
                user_id.to_string() == metadata.owner_id
            } else {
                false
            }
        }
    }
}

#[debug_handler]
pub async fn get_site(
    Path(site_id): Path<String>,
    Query(query): Query<GetSiteQuery>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Response {
    match get_site_result(site_id, query, user, context).await {
        Ok(response) => response,
        Err(e) => e.into_response(),
    }
}

async fn get_site_result(
    site_id: String,
    query: GetSiteQuery,
    user: RequestUser,
    context: ApiContext,
) -> Result<Response, ApiError> {
    check_bad_form(query.validate())?;
    verify_site_owner(&context, &user, &site_id).await?;

    let site_metadata = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Check if site is disabled
    if site_metadata.disabled
        && user.user_type != UserType::Admin
        && user.user_type != UserType::Cron
    {
        return Err(ApiError::forbidden().code(ApiErrorCode::SiteDisabled));
    }

    let site = context
        .site_repo
        .get_site_latest_version(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Check whether the non-admin/owner's bandwidth usage exceeds the allowed limit
    let admin_or_owner = is_admin_or_site_owner(&site_metadata, &user);
    if !admin_or_owner {
        context
            .cache
            .check_bandwidth_exceeded(
                &site_id,
                site.calculate_site_size(),
                site_metadata.site_type,
            )
            .await?;
    }

    if site.published || admin_or_owner {
        context
            .cache
            .increase_request_count(
                &site_id,
                site.calculate_site_size(),
                site_metadata.site_type,
            )
            .await;

        if let Some(update_key) = query.update_key {
            let content_updated = site.content_updated_at;
            return if content_updated == update_key {
                Ok(StatusCode::NO_CONTENT.into_response())
            } else {
                Ok(Json(to_api_response(
                    site,
                    admin_or_owner,
                    site_metadata.disabled,
                ))
                .into_response())
            };
        } else {
            return Ok(Json(to_api_response(
                site,
                admin_or_owner,
                site_metadata.disabled,
            ))
            .into_response());
        };
    }
    Err(ApiError::forbidden())
}
