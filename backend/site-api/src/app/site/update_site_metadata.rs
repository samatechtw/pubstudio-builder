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

    let admin_or_cron = user.user_type == UserType::Admin || user.user_type == UserType::Cron;

    // Owner can only update domains
    if (dto.disabled.is_some() || dto.site_type.is_some()) && !admin_or_cron {
        return Err(ApiError::forbidden());
    }

    if let Some(domains) = &dto.domains {
        validate_custom_domains(domains)?;
    }

    let mut tx = context
        .metadata_repo
        .start_transaction()
        .await
        .map_err(|e| {
            ApiError::internal_error().message(format!("Failed to save domains: {}", e))
        })?;

    if dto.disabled.is_some() || dto.site_type.is_some() {
        let metadata = context
            .metadata_repo
            .update_site_metadata(&mut tx, &id, &dto)
            .await
            .map_err(|e| {
                ApiError::internal_error().message(format!("Failed to update site: {}", e))
            })?;

        // Update Metadata Cache
        context
            .cache
            .create_or_update_metadata(
                &id,
                &metadata.owner_id,
                metadata.site_type,
                metadata.disabled,
            )
            .await;
    }

    if let Some(domains) = &dto.domains {
        context
            .metadata_repo
            .set_site_domains(&mut tx, &id, domains)
            .await
            .map_err(|e| {
                ApiError::internal_error().message(format!("Failed to save domains: {}", e))
            })?;

        // Update domain -> site_id mapping
        context.cache.update_site_domains(&id, domains).await
    }

    tx.commit().await.map_err(|e| {
        ApiError::internal_error().message(format!("Failed to save domains: {}", e))
    })?;

    Ok(())
}
