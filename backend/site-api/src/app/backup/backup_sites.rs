use chrono::Utc;
use lib_shared_site_api::clients::s3_client::S3Client;
use lib_shared_types::{
    entity::site_api::site_metadata_entity::SiteMetadataEntity, shared::core::ExecEnv,
};
use serde::Serialize;
use tracing::{error, info};
use uuid::Uuid;

use crate::{
    api_context::ApiContext,
    db::backup_repo::{BackupEntityProps, CreateBackupEntityResult},
};

use super::helpers::delete_backup_from_r2;

#[derive(Serialize)]
pub struct BackupSitesResult {
    pub total_sites: usize,
    pub successful_backups: usize,
}

impl BackupSitesResult {
    pub fn new(sites: usize, backups: usize) -> BackupSitesResult {
        return BackupSitesResult {
            total_sites: sites,
            successful_backups: backups,
        };
    }
}

async fn upload_backup(
    env: ExecEnv,
    s3_client: &S3Client,
    site_data: &(SiteMetadataEntity, Vec<u8>),
) -> Option<BackupEntityProps> {
    let created_at = Utc::now();
    let site = &site_data.0;
    let upload_file_content = site_data.1.clone();
    let key = format!("{}/{}.db", site.id, created_at.format("%Y-%m-%d %H:%M:%S"));
    let site_id = match Uuid::parse_str(&site.id) {
        Ok(site_id) => site_id,
        Err(e) => {
            error!(
                "Failed to parse id for backup: {}, {}",
                site.id,
                e.to_string()
            );
            return None;
        }
    };
    if env == ExecEnv::Ci || env == ExecEnv::Dev {
        return Some(BackupEntityProps {
            site_id,
            url: key,
            created_at,
        });
    }
    match s3_client.upload_backup(&key, upload_file_content).await {
        Ok(_) => match Uuid::parse_str(&site.id) {
            Ok(site_id) => {
                return Some(BackupEntityProps {
                    site_id,
                    url: key,
                    created_at,
                })
            }
            Err(e) => error!(
                "Failed to parse id for backup: {}, {}",
                site.id,
                e.to_string()
            ),
        },
        Err(e) => error!("Failed to upload backup: {}, {}", key, e.to_string()),
    };
    return None;
}

pub async fn backup_all_sites(context: ApiContext) -> BackupSitesResult {
    // List all sites
    let sites = match context.metadata_repo.list_sites().await {
        Ok(sites) => sites,
        Err(e) => {
            error!("Failed to get sites: {}", e.to_string());
            return BackupSitesResult::new(0, 0);
        }
    };

    backup_sites(&context, sites).await
}

// TODO -- parallelize steps where possible
pub async fn backup_sites(
    context: &ApiContext,
    sites: Vec<SiteMetadataEntity>,
) -> BackupSitesResult {
    let sites_count = sites.len();

    // Vacuum sites to local file
    let mut vacuumed_sites: Vec<(SiteMetadataEntity, Vec<u8>)> = Vec::new();
    for site in sites {
        match context.site_repo.export_backup(&site.id).await {
            Ok(file_content) => {
                let tuple = (site, file_content);
                vacuumed_sites.push(tuple);
            }
            Err(e) => error!("Failed to vacuum site: {}, {}", site.id, e.to_string()),
        }
    }

    // Upload backups
    let mut entity_props: Vec<BackupEntityProps> = Vec::new();
    for site in &vacuumed_sites {
        if let Some(props) = upload_backup(context.config.exec_env, &context.s3_client, site).await
        {
            entity_props.push(props);
        }
    }

    // Record backups in DB
    let mut backup_counts: Vec<CreateBackupEntityResult> = Vec::new();
    for props in entity_props {
        let url = props.url.clone();
        match context.backup_repo.create_backup(props).await {
            Ok(backup) => {
                backup_counts.push(backup);
            }
            Err(e) => error!("Failed to record backup to DB: {}, {}", url, e.to_string()),
        };
    }

    // Delete extra backups
    for record in &backup_counts {
        if record.count > 10 {
            // Get oldest backups starting with the 10th
            match context
                .backup_repo
                .list_backups_after(&record.site_id, 10)
                .await
            {
                Ok(sites_to_delete) => {
                    // Delete old backups from R2
                    for delete_site in sites_to_delete {
                        if delete_backup_from_r2(
                            context.config.exec_env,
                            &context.s3_client,
                            &delete_site.url,
                        )
                        .await
                        {
                            // Delete backup from DB
                            match context.backup_repo.delete_backup(delete_site.id).await {
                                Ok(_) => {}
                                Err(e) => error!(
                                    "Failed to delete backup record: {}, {}",
                                    delete_site.url,
                                    e.to_string()
                                ),
                            };
                        }
                    }
                }
                Err(e) => error!(
                    "Failed to query backups for deletion: {}, {}",
                    record.site_id,
                    e.to_string()
                ),
            }
        }
    }
    BackupSitesResult::new(sites_count, backup_counts.len())
}

// To satisfy tokio-cron async closure constraints, which expects an async function with empty return
pub async fn backup_sites_helper(context: ApiContext) -> () {
    let result = backup_all_sites(context).await;
    info!(
        "Backed up {} of {} sites",
        result.successful_backups, result.total_sites
    );
    ()
}
