use axum::{extract::State, Json};
use lib_shared_site_api::error::api_error::ApiError;
use lib_shared_types::{
    dto::site_api::site_metadata_viewmodel::{vec_from_entity, SiteMetadataViewModel},
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
};

use crate::api_context::ApiContext;

fn to_api_response(metadata: Vec<SiteMetadataEntity>) -> Json<Vec<SiteMetadataViewModel>> {
    Json(
        metadata
            .into_iter()
            .map(|meta| SiteMetadataViewModel {
                id: meta.id,
                owner_email: meta.owner_email,
                owner_id: meta.owner_id,
                location: meta.location,
                disabled: meta.disabled,
                site_type: meta.site_type,
                custom_domains: vec_from_entity(meta.domains),
            })
            .collect(),
    )
}

pub async fn list_sites(
    State(context): State<ApiContext>,
) -> Result<Json<Vec<SiteMetadataViewModel>>, ApiError> {
    let sites = context
        .metadata_repo
        .list_sites()
        .await
        .map_err(|_| ApiError::internal_error())?;

    Ok(to_api_response(sites))
}
