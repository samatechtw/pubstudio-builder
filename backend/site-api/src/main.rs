use axum::http::{header, Method};
use axum::Router;
use lib_shared_site_api::cache::cache::AppCache;
use lib_shared_site_api::clients::s3_client::S3Client;
use lib_shared_site_api::log::{create_trace_layer, setup_logging};

use clap::Parser;
use site_api::api_context::ApiContext;
use site_api::app::app_router::app_router;
use site_api::config::Config;
use site_api::cron::setup_cron_jobs;
use site_api::db::backup_repo::{BackupRepo, DynBackupRepo};
use site_api::db::custom_data_info_repo::{CustomDataInfoRepo, DynCustomDataInfoRepo};
use site_api::db::custom_data_repo::{CustomDataRepo, DynCustomDataRepo};
use site_api::db::site_db_pool_manager::DbPoolManager;
use site_api::db::site_repo::{DynSiteRepo, SiteRepo};
use site_api::db::sites_metadata_repo::{DynSitesMetadataRepo, SitesMetadataRepo};
use site_api::db::usage_repo::{DynUsageRepo, UsageRepo};
use sqlx::migrate::MigrateDatabase;
use sqlx::sqlite::SqlitePool;
use std::collections::HashMap;
use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};

use tokio::sync::RwLock;

#[tokio::main]
async fn main() {
    sqlx::any::install_default_drivers();

    // Allows running from workspace root, or crate directory
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap_or(".".into());
    let _ = dotenvy::from_path(format!("{manifest_dir}/.env"));

    const CRATE_NAME: &str = env!("CARGO_CRATE_NAME");

    // Parse config
    let config = Config::parse();
    let host = config.api_host.clone();
    let port = config.api_port.clone();
    let s3_url = config.s3_url.clone();
    let s3_secret_access_key = config.s3_secret_access_key.clone();
    let s3_access_key_id = config.s3_access_key_id.clone();

    let api_url = format!("{}:{}", host, port);

    // Setup tracing
    let _guard = setup_logging(CRATE_NAME);

    // Set up metadata database
    let metadata_db_url = &format!("sqlite:{}/db/metadata/sites_metadata.db", manifest_dir);
    if !sqlx::Any::database_exists(metadata_db_url).await.unwrap() {
        sqlx::Any::create_database(metadata_db_url).await.unwrap();
        println!("created sqlite metadata database: {}", metadata_db_url);
    }
    let metadata_db_pool = SqlitePool::connect(metadata_db_url).await.unwrap();

    // Set up ApiContext
    let metadata_repo = Arc::new(SitesMetadataRepo {
        metadata_db_pool: metadata_db_pool.clone(),
    }) as DynSitesMetadataRepo;
    let backup_repo = Arc::new(BackupRepo {
        metadata_db_pool: metadata_db_pool.clone(),
    }) as DynBackupRepo;
    let usage_repo = Arc::new(UsageRepo {
        metadata_db_pool: metadata_db_pool.clone(),
    }) as DynUsageRepo;

    let site_db_pools = Arc::new(RwLock::new(HashMap::default()));
    let db_pool_manager = DbPoolManager::new(site_db_pools);

    let site_repo = Arc::new(SiteRepo {
        db_pool_manager: db_pool_manager.clone(),
        manifest_dir: manifest_dir.clone(),
    }) as DynSiteRepo;
    let custom_data_info_repo = Arc::new(CustomDataInfoRepo {
        db_pool_manager: db_pool_manager.clone(),
        manifest_dir: manifest_dir.clone(),
    }) as DynCustomDataInfoRepo;
    let custom_data_repo = Arc::new(CustomDataRepo {
        db_pool_manager,
        manifest_dir,
    }) as DynCustomDataRepo;

    let s3_client = S3Client::new(s3_url, s3_access_key_id, s3_secret_access_key);

    let cache = AppCache::new(config.exec_env);

    let context = ApiContext {
        config: Arc::new(config),
        s3_client,
        metadata_repo,
        backup_repo,
        site_repo,
        usage_repo,
        custom_data_info_repo,
        custom_data_repo,
        cache,
    };

    // Setup CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers(vec![
            header::ACCEPT,
            header::ACCEPT_LANGUAGE,
            header::AUTHORIZATION,
            header::CONTENT_LANGUAGE,
            header::CONTENT_TYPE,
        ])
        .allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::HEAD,
            Method::OPTIONS,
            Method::DELETE,
        ]);

    setup_cron_jobs(&context);

    // Run metadata migrations
    sqlx::migrate!("./db/metadata/migrations")
        .run(&metadata_db_pool)
        .await
        .unwrap();
    // Run site migrations
    let sites = context.metadata_repo.list_sites().await.unwrap();
    context.site_repo.migrate_all(sites).await.unwrap();

    // Run server
    let mut app = Router::new()
        .merge(app_router(&context))
        .with_state(context)
        .layer(ServiceBuilder::new().layer(cors));
    // Enables logging. Use `RUST_LOG=trace`
    app = create_trace_layer(app);

    let listener = tokio::net::TcpListener::bind(api_url).await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
