use lib_shared_site_api::{cache::cache::AppCache, clients::s3_client::S3Client};

use crate::{
    config::Config,
    db::{
        backup_repo::DynBackupRepo, custom_data_info_repo::DynCustomDataInfoRepo,
        custom_data_repo::DynCustomDataRepo, site_repo::DynSiteRepo,
        sites_metadata_repo::DynSitesMetadataRepo, usage_repo::DynUsageRepo,
    },
};
use std::sync::Arc;

#[derive(Clone)]
pub struct ApiContext {
    pub config: Arc<Config>,
    pub s3_client: S3Client,
    pub metadata_repo: DynSitesMetadataRepo,
    pub backup_repo: DynBackupRepo,
    pub site_repo: DynSiteRepo,
    pub usage_repo: DynUsageRepo,
    pub custom_data_info_repo: DynCustomDataInfoRepo,
    pub custom_data_repo: DynCustomDataRepo,
    pub cache: AppCache,
}
