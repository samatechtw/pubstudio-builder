use axum::{
    extract::{Path, State},
    Extension, Json,
};
use axum_macros::debug_handler;
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::get_site_domains_dto::{to_api_response, GetSiteDomainsViewModel},
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
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
pub async fn get_site_domains(
    Path(site_id): Path<String>,
    Extension(user): Extension<RequestUser>,
    State(context): State<ApiContext>,
) -> Result<Json<GetSiteDomainsViewModel>, ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;

    let site_metadata = context
        .metadata_repo
        .get_site_metadata(&site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    if is_admin_or_site_owner(&site_metadata, &user) {
        return Ok(Json(to_api_response(site_metadata)));
    }
    Err(ApiError::forbidden())
}
