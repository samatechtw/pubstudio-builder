use axum::{
    extract::{Path, State},
    Extension, Json,
};
use lib_shared_site_api::{
    error::{api_error::ApiError, helpers::check_bad_form},
    util::json_extractor::PsJson,
};
use lib_shared_types::{
    dto::site_api::{
        publish_site_dto::PublishSiteDto,
        site_viewmodel::{to_api_response, SiteViewModel},
    },
    shared::user::RequestUser,
};
use validator::Validate;

use crate::{api_context::ApiContext, middleware::auth::verify_site_owner};

pub async fn publish_site(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(dto): PsJson<PublishSiteDto>,
) -> Result<Json<SiteViewModel>, ApiError> {
    check_bad_form(dto.validate())?;
    verify_site_owner(&context, &user, &id).await?;

    let site = context
        .site_repo
        .publish_site(&id, dto)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(Json(to_api_response(site)))
}
