use axum::http::StatusCode;
use axum::{extract::State, Json};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_site_api::error::helpers::{check_bad_form, validate_custom_domains};
use lib_shared_site_api::util::json_extractor::PsJson;
use lib_shared_types::dto::site_api::create_metadata_dto::CreateSiteMetadataDto;
use lib_shared_types::dto::site_api::create_site_dto::CreateSiteResponse;
use lib_shared_types::dto::site_api::create_site_from_backup_dto::CreateSiteFromBackupDto;
use validator::Validate;

use crate::api_context::ApiContext;
use crate::app::backup::helpers::get_backup_from_r2;

fn to_api_response(site_id: String) -> Json<CreateSiteResponse> {
    return Json(CreateSiteResponse { id: site_id });
}

async fn create_site_from_backup_helper(
    context: &ApiContext,
    dto: CreateSiteFromBackupDto,
) -> Result<String, ApiError> {
    let site_type = dto.site_type.clone();

    let domains = &dto.domains.clone();
    validate_custom_domains(domains)?;

    let site_id = dto.site_id.clone();
    let metadata_dto: CreateSiteMetadataDto = (&dto).into();

    let backup_data =
        get_backup_from_r2(context.config.exec_env, &context.s3_client, &dto.backup_url).await?;

    // Restore site from R2 backup
    context
        .site_repo
        .create_from_backup(&dto.site_id, backup_data)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Add site metadata to sites_metadata database
    let _ = context
        .metadata_repo
        .create_site(metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    let site = context
        .site_repo
        .get_site_latest_version(&site_id, false)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    // Add an in-memory cache to the app
    for domain in domains {
        context.cache.insert_domain_mapping(&site_id, domain).await;
    }
    let size = site.calculate_site_size();
    context
        .cache
        .create_or_update_usage(&site_id, size, site_type)
        .await;

    Ok(site_id)
}

pub async fn create_site_from_backup(
    State(context): State<ApiContext>,
    PsJson(dto): PsJson<CreateSiteFromBackupDto>,
) -> Result<(StatusCode, Json<CreateSiteResponse>), ApiError> {
    check_bad_form(dto.validate())?;

    let site_id = create_site_from_backup_helper(&context, dto).await?;

    Ok((StatusCode::CREATED, to_api_response(site_id)))
}
