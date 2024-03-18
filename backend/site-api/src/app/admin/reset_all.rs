use axum::extract::State;
use lib_shared_site_api::{
    db::{
        db_error::DbError,
        sites_seed_data::{
            make_namespace, make_site_context, make_site_editor, make_site_history,
            make_site_pages, sites_seed_data, SITE_SEED_CONTACT_TABLE, SITE_SEED_DEFAULTS,
            SITE_SEED_VERSION,
        },
    },
    error::api_error::ApiError,
    util::{domains::merge_domains, json_extractor::PsJson},
};
use lib_shared_types::{
    dto::site_api::{create_site_dto::CreateSiteDto, reset_all_dto::ResetAllDto},
    shared::core::ExecEnv,
};

use crate::{
    api_context::ApiContext,
    app::{
        custom::create_table::create_custom_table_helper, site::create_site::create_site_helper,
    },
};

pub async fn reset_all(
    State(context): State<ApiContext>,
    PsJson(dto): PsJson<ResetAllDto>,
) -> Result<(), ApiError> {
    let env = context.config.exec_env;
    if env != ExecEnv::Dev && env != ExecEnv::Ci {
        return Err(ApiError::forbidden());
    }

    // Get list of sites for deletion
    let sites = context.metadata_repo.list_sites().await.unwrap_or(vec![]);

    // Delete data in sites_metadata.db and re-initialize
    context
        .metadata_repo
        .reset()
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    // Clean up (delete) database files
    for site in sites.iter() {
        match context.site_repo.delete_site(&site.id).await {
            Err(DbError::NoDb(_)) => println!("DB not found: {}", &site.id),
            Err(e) => return Err(ApiError::internal_error().message(e)),
            _ => {}
        };
    }

    // Clear all caches
    context.cache.cache.invalidate_all();
    context.cache.sync().await;
    context.cache.metadata_cache.invalidate_all();
    context.cache.metadata_cache.run_pending_tasks().await;
    context.cache.domain_cache.invalidate_all();
    context.cache.domain_cache.run_pending_tasks().await;
    context.cache.site_data_cache.invalidate_all();
    context.cache.site_data_cache.run_pending_tasks().await;

    // Seed new sites
    let seed_data = sites_seed_data();
    for site_id in dto.seeds.into_iter() {
        match seed_data.iter().find(|s| s.id.to_string() == site_id) {
            Some(data) => {
                let namespace = make_namespace(&data.name);
                create_site_helper(
                    &context,
                    CreateSiteDto {
                        id: site_id.clone(),
                        owner_id: data.owner_id.to_string(),
                        name: data.name.clone(),
                        version: SITE_SEED_VERSION.into(),
                        context: make_site_context(&namespace).into(),
                        defaults: SITE_SEED_DEFAULTS.into(),
                        editor: make_site_editor(&namespace).into(),
                        history: make_site_history(&namespace).into(),
                        pages: make_site_pages(&namespace).into(),
                        published: data.published.clone(),
                        domains: merge_domains(
                            data.custom_domains.clone(),
                            &data.subdomain,
                            &format!("{}.pubstud.io", context.config.exec_env),
                        ),
                        site_type: data.site_type.clone(),
                    },
                )
                .await?;

                create_custom_table_helper(
                    &context,
                    &site_id,
                    serde_json::from_str(SITE_SEED_CONTACT_TABLE).unwrap(),
                )
                .await?;
            }
            None => {
                println!("Failed to seed site: {}", site_id);
            }
        }
    }

    // Reset usage
    context
        .usage_repo
        .insert_usage(&context.cache.cache)
        .await
        .map_err(|e| ApiError::internal_error().message(e))?;

    Ok(())
}
