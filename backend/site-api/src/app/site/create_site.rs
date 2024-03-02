use axum::http::StatusCode;
use axum::{extract::State, Json};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_site_api::error::helpers::{check_bad_form, validate_custom_domains};
use lib_shared_site_api::util::json_extractor::PsJson;
use lib_shared_site_api::validator::site_data_len_validator::SiteDataValidator;
use lib_shared_types::dto::site_api::create_metadata_dto::to_metadata_dto;
use lib_shared_types::dto::site_api::create_site_dto::{CreateSiteDto, CreateSiteResponse};
use validator::Validate;

use crate::api_context::ApiContext;

fn to_api_response(site_id: String) -> Json<CreateSiteResponse> {
    return Json(CreateSiteResponse { id: site_id });
}

pub async fn create_site_helper(
    context: &ApiContext,
    dto: CreateSiteDto,
) -> Result<String, ApiError> {
    let site_type = dto.site_type.clone();

    let validator = SiteDataValidator::new(site_type);
    validator.validate_context(&dto.context)?;
    validator.validate_history(&dto.history)?;
    validator.validate_pages(&dto.pages)?;

    let domains = &dto.domains.clone();
    validate_custom_domains(domains)?;

    let site_id = dto.id.clone();
    let metadata_dto = to_metadata_dto(&dto);

    // Create and run migrations on a new site database
    let site = context
        .site_repo
        .create_site(dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Add site metadata to sites_metadata database
    let _ = context
        .metadata_repo
        .create_site(metadata_dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Add an in-memory cache to the app
    for domain in domains {
        context.cache.insert_domain_mapping(&site_id, domain).await;
    }
    context
        .cache
        .create_or_update_usage(&site_id, &site, site_type)
        .await;

    Ok(site_id)
}

pub async fn create_site(
    State(context): State<ApiContext>,
    PsJson(dto): PsJson<CreateSiteDto>,
) -> Result<(StatusCode, Json<CreateSiteResponse>), ApiError> {
    check_bad_form(dto.validate())?;

    let site_id = create_site_helper(&context, dto).await?;

    Ok((StatusCode::CREATED, to_api_response(site_id)))
}
