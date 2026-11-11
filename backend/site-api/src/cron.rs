use lib_shared_site_api::util::schedule::spawn_daily;

use crate::{
    api_context::ApiContext,
    app::{backup::backup_sites::backup_sites_helper, usage::helpers::persist_usage_helper},
};

pub fn setup_cron_jobs(context: &ApiContext) {
    let job_context = context.clone();
    spawn_daily("BackupSites", 0, move || {
        backup_sites_helper(job_context.clone())
    });

    let job_context = context.clone();
    spawn_daily("PersistUsage", 0, move || {
        persist_usage_helper(job_context.clone())
    });
}
