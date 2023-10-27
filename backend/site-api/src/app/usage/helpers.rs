use tracing::{error, info};

use crate::api_context::ApiContext;

pub async fn persist_cache_helper(context: ApiContext) -> () {
    let cache_length = context.cache.cache.weighted_size();

    if let Err(e) = context.usage_repo.insert_usage(&context.cache.cache).await {
        error!(err = e.to_string(), "Failed to save site usage to DB");
    }

    info!("Persisted site data cache, len={cache_length}");
    ()
}

pub async fn reset_cache_helper(context: ApiContext) -> () {
    context.cache.reset_bandwidth().await;

    info!("Resetting cache bandwidth data");
    ()
}
