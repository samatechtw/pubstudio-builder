use crate::app::usage::notify::notify_allowance_exceeded;
use lib_shared_site_api::db::db_error::DbError;
use lib_shared_types::entity::site_api::site_metadata_entity::UpdateSiteMetadataEntity;
use tracing::{error, info};

use crate::api_context::ApiContext;

async fn persist_custom_data_usage(context: &ApiContext) -> Result<i64, DbError> {
    let sites = context.metadata_repo.list_sites().await?;
    let mut result: Result<i64, DbError> = Ok(0);

    for site in sites {
        let usage_result = context
            .custom_data_info_repo
            .get_custom_tables_size(&site.id)
            .await;
        match usage_result {
            Ok(usage) => {
                let update_result = context
                    .metadata_repo
                    .update_site_metadata(
                        &site.id,
                        &UpdateSiteMetadataEntity::custom_data_usage(usage),
                    )
                    .await;
                match update_result {
                    Ok(meta) => {
                        result = Ok(usage + result.unwrap_or(0));
                        if usage
                            > meta
                                .site_type
                                .get_custom_data_allowance(context.config.exec_env)
                        {
                            notify_allowance_exceeded(
                                &meta.owner_email,
                                &context.config.sendgrid_api_key,
                                &context.config.platform_web_url,
                                &site,
                            )
                            .await;
                        }
                    }
                    Err(e) => result = Err(e),
                }
            }
            Err(e) => result = Err(e),
        }
    }
    result
}

pub async fn persist_usage_helper(context: ApiContext) -> () {
    let cache_length = context.cache.cache.weighted_size();

    if let Err(e) = context.usage_repo.insert_usage(&context.cache.cache).await {
        error!(err = e.to_string(), "Failed to save site usage to DB");
    }

    let custom_data_usage = match persist_custom_data_usage(&context).await {
        Err(e) => {
            error!(err = e.to_string(), "Failed to save custom data usage");
            "?".to_string()
        }
        Ok(usage) => usage.to_string(),
    };

    info!("Persisted site data cache and custom data usage, len={cache_length}, usage={custom_data_usage}");
    ()
}

pub async fn reset_cache_helper(context: ApiContext) -> () {
    context.cache.reset_bandwidth().await;

    info!("Resetting cache bandwidth data");
    ()
}
