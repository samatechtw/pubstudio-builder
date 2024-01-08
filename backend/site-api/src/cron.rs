use tokio_cron::{Job, Scheduler};

use crate::{
    api_context::ApiContext,
    app::{
        backup::backup_sites::backup_sites_helper,
        usage::helpers::{persist_cache_helper, reset_cache_helper},
    },
};

// Set up cron jobs
pub fn setup_cron_jobs(context: &ApiContext) {
    // Set up backup cron
    let mut scheduler = Scheduler::utc();
    let job_context = context.clone();
    // TEST backup every 15 seconds: "*/15 * * * * *"
    // backup every day at midnight: "0 0 0 * * *"
    scheduler.add(Job::new("0 0 0 * * *", move || {
        backup_sites_helper(job_context.clone())
    }));

    // Set up site usage cron
    let job_context_clone = context.clone();
    scheduler.add(Job::new("0 0 0 * * *", move || {
        persist_cache_helper(job_context_clone.clone())
    }));

    // Monthly reset site usage cron
    // At 00:00:00am, on the 1st day, every month between January and December
    let job_context = context.clone();
    scheduler.add(Job::new("0 0 0 1 1-12 ? *", move || {
        reset_cache_helper(job_context.clone())
    }));
}
