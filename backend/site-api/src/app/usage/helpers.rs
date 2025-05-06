use std::collections::HashMap;

use crate::{app::usage::notify::notify_allowance_exceeded, util::mail_helpers::make_mail_params};
use chrono::Utc;
use lib_shared_site_api::db::db_error::DbError;
use lib_shared_types::entity::site_api::{
    site_metadata_entity::UpdateSiteMetadataEntity, site_usage_entity::SiteUsageEntityWithTotals,
};
use tracing::{error, info};

use crate::api_context::ApiContext;

pub async fn populate_usage_cache(context: &ApiContext) -> Result<(), DbError> {
    let result = context.usage_repo.list_usage_totals().await?;

    for usage in &result {
        let site_id = &usage.site_id;

        let usage_totals = SiteUsageEntityWithTotals {
            id: usage.id,
            site_id: site_id.clone(),
            request_count: 0,
            total_request_count: usage.total_request_count,
            site_view_count: 0,
            total_site_view_count: usage.total_site_view_count,
            request_error_count: 0,
            total_bandwidth: 0,
            current_monthly_bandwidth: usage.current_monthly_bandwidth,
            page_views: HashMap::new(),
            total_page_views: usage.total_page_views.clone(),
            start_time: Utc::now(), // Discarded
            end_time: Utc::now(),   // Discarded
        };
        let site = context
            .site_repo
            .get_site_latest_version(site_id, true)
            .await?;

        let site_metadata = context.metadata_repo.get_site_metadata(site_id).await?;

        context
            .cache
            .reset_usage(
                &usage_totals,
                site.calculate_site_size(),
                site_metadata.site_type,
            )
            .await;
    }
    Ok(())
}

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
                            let params = make_mail_params(&context.config, &meta.owner_email);
                            notify_allowance_exceeded(params, &site).await;
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
    context.cache.reset_bandwidth(false).await;

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

// Reset cache bandwidth monthly, so
pub async fn reset_cache_helper(context: ApiContext) -> () {
    context.cache.reset_bandwidth(true).await;

    info!("Resetting cache bandwidth data");
    ()
}
