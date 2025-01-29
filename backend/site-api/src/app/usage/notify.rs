use lib_shared_site_api::mail::{send_mail, ApiMailParams};
use lib_shared_types::entity::site_api::site_metadata_entity::SiteMetadataEntity;
use tracing::error;

pub async fn notify_allowance_exceeded(params: ApiMailParams, meta: &SiteMetadataEntity) {
    // TODO -- link to the custom data page to allow clearing data
    let text = format!(
        "
      The data limit for custom tables has been exceeded for site ID: \"{}\"\n\n
      Delete unused tables or entries by clicking the link below:\n\n
      {}/build/{}",
        meta.id, params.frontend_url, meta.id
    );

    let result = send_mail(
        params.params,
        "PubStudio custom data limit exceeded",
        Some(text.into()),
        None,
    )
    .await;
    if let Err(e) = result {
        error!(
            err = e.to_string(),
            "Failed to notify custom data allowance exceeded: {}", meta.id
        );
    }
}
