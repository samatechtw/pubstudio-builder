use lib_shared_site_api::{clients::ssg_client::ssg_generate, error::api_error::ApiError};
use lib_shared_types::{
    dto::site_api::ssg_dto::{site_to_ssg_input, SsgGenerateRequest, SsgOptions},
    entity::site_api::static_page_entity::StaticPageEntity,
};
use tracing::{error, info, warn};

use crate::api_context::ApiContext;

// Cache-busting version for the shared hydration runtime script
const RUNTIME_SRC: &str = concat!("/_ps/site.js?v=", env!("CARGO_PKG_VERSION"));

fn base_url_from_domain(domain: &str) -> String {
    // Local development domains are served over plain http
    if domain == "localhost" || domain.ends_with(".localhost") {
        format!("http://{}", domain)
    } else {
        format!("https://{}", domain)
    }
}

// Prerender the published site with the SSG service and store the result in the static_pages
// table. Clears stored pages when the site is unpublished or generation fails.
pub async fn regenerate_static_pages(context: &ApiContext, site_id: &str) -> Result<(), ApiError> {
    let Some(ssg_url) = context.config.ssg_url.clone() else {
        return Ok(());
    };

    let site = context
        .site_repo
        .get_site_latest_version(site_id, true)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;

    if !site.published {
        context
            .site_repo
            .clear_static_pages(site_id)
            .await
            .map_err(|e| ApiError::internal_error().message(e))?;
        info!("Cleared static pages for unpublished site {}", site_id);
        return Ok(());
    }

    let metadata = context
        .metadata_repo
        .get_site_metadata(site_id)
        .await
        .map_err(|e| ApiError::not_found().message(e))?;
    let base_url = metadata
        .domains
        .first()
        .map(|d| base_url_from_domain(&d.domain));

    let request = SsgGenerateRequest {
        site: site_to_ssg_input(&site, site_id),
        options: SsgOptions {
            base_url,
            runtime_src: RUNTIME_SRC.into(),
        },
    };

    match ssg_generate(&ssg_url, &request).await {
        Ok(result) => {
            for warning in &result.warnings {
                warn!("SSG warning for site {}: {}", site_id, warning);
            }
            let pages: Vec<StaticPageEntity> = result
                .pages
                .into_iter()
                .map(|p| StaticPageEntity {
                    route: p.route,
                    body: p.body,
                    content_type: p.content_type,
                    content_updated_at: site.content_updated_at,
                })
                .collect();
            let count = pages.len();
            context
                .site_repo
                .replace_static_pages(site_id, pages)
                .await
                .map_err(|e| ApiError::internal_error().message(e))?;
            info!(
                "Generated {} static pages for site {} with {}",
                count, site_id, result.generator
            );
            Ok(())
        }
        Err(e) => {
            // Never leave stale pages around after a failed generation
            if let Err(clear_err) = context.site_repo.clear_static_pages(site_id).await {
                error!(
                    "Failed to clear static pages for site {}: {}",
                    site_id, clear_err
                );
            }
            Err(e)
        }
    }
}

// Fire-and-forget regeneration, used by publish/update handlers. Skipped when
// `expected_content_updated_at` is set to debounce builder saves.
pub fn spawn_regenerate_static_pages(
    context: &ApiContext,
    site_id: &str,
    expected_content_updated_at: Option<i64>,
) {
    let context = context.clone();
    let site_id = site_id.to_string();
    tokio::spawn(async move {
        if let Some(expected) = expected_content_updated_at {
            tokio::time::sleep(std::time::Duration::from_secs(2)).await;
            match context
                .site_repo
                .get_site_latest_version(&site_id, true)
                .await
            {
                Ok(site) => {
                    if site.content_updated_at != expected {
                        return;
                    }
                }
                Err(_) => return,
            }
        }
        if let Err(e) = regenerate_static_pages(&context, &site_id).await {
            error!("Static generation failed for site {}: {}", site_id, e);
        }
    });
}
