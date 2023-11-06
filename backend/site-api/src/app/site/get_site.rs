use axum::{
    extract::{Path, State, Query},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::get_site_dto::{to_api_response, GetSiteDto, GetSiteQuery},
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
    error::api_error::ApiErrorCode,
    shared::user::{RequestUser, UserType},
};

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
) -> Result<Json<GetSiteDto>, ApiError> {
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

            match query.update_key {
                Some(update_key) if site.update_key == update_key => {
                    return Ok(Json(GetSiteDto::default()))
                }
                _ => return Ok(Json(to_api_response(
                    site,
                    admin_or_owner,
                    site_metadata.disabled,
                ))),
            }
    }
    Err(ApiError::forbidden())
}
