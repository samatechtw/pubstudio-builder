use axum::{
    extract::{Path, State},
    Extension,
};
use lib_shared_site_api::{
    error::{api_error::ApiError, helpers::validate_custom_domains},
    util::json_extractor::PsJson,
};
use lib_shared_types::{
    dto::site_api::update_metadata_dto::UpdateSiteMetadataDto,
    shared::user::{RequestUser, UserType},
};

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn update_site_metadata(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<UpdateSiteMetadataDto>,
) -> Result<(), ApiError> {
    verify_site_owner(&context, &user, &id).await?;

    // Owner can only update domains
    if dto.disabled.is_some()
        && user.user_type != UserType::Admin
        && user.user_type != UserType::Cron
    {
        return Err(ApiError::forbidden());
    }

    if let Some(domains) = &dto.domains {
        validate_custom_domains(domains)?;
    }

    if !dto.domains.is_some() && !dto.disabled.is_some() {
        return Ok(());
    }
    let mut tx = context
        .metadata_repo
        .start_transaction()
        .await
        .map_err(|e| {
            ApiError::internal_error().message(format!("Failed to save domains: {}", e))
        })?;

    if dto.disabled.is_some() {
        context
            .metadata_repo
            .update_site_metadata(&mut tx, &id, &dto)
            .await
            .map_err(|e| {
                ApiError::internal_error().message(format!("Failed to update site: {}", e))
            })?;
    }

    if let Some(domains) = &dto.domains {
        context
            .metadata_repo
            .set_site_domains(&mut tx, &id, domains)
            .await
            .map_err(|e| {
                ApiError::internal_error().message(format!("Failed to save domains: {}", e))
            })?;
    }

    tx.commit().await.map_err(|e| {
        ApiError::internal_error().message(format!("Failed to save domains: {}", e))
    })?;

    Ok(())
}
