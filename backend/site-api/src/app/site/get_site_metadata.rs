use axum::{
    extract::{Path, State},
    Json,
};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::dto::site_api::site_metadata_viewmodel::SiteMetadataViewModel;

use crate::api_context::ApiContext;

pub async fn get_site_metadata(
    Path(id): Path<String>,
    State(context): State<ApiContext>,
) -> Result<Json<SiteMetadataViewModel>, ApiError> {
    let meta = context
        .metadata_repo
        .get_site_metadata(&id)
        .await
        .map_err(|_| ApiError::not_found().message("Site not found"))?;

    Ok(Json(SiteMetadataViewModel {
        id: meta.id,
        owner_email: meta.owner_email,
        owner_id: meta.owner_id,
        location: meta.location,
        disabled: meta.disabled,
        site_type: meta.site_type,
        custom_domains: meta.domains,
    }))
}
