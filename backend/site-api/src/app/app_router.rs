use crate::api_context::ApiContext;

use crate::app::{custom, health, publish, site, usage};
use crate::middleware::auth::{
    auth_admin, auth_admin_owner, auth_admin_owner_anonymous, error_cache,
};
use axum::handler::Handler;

use axum::http::StatusCode;
use axum::middleware::from_fn_with_state;
use axum::response::IntoResponse;
use axum::routing::{delete, patch, post};
use axum::{routing::get, Router};

use super::admin;
use super::backup;
use super::serve::serve_web_site;

pub fn app_router(context: &ApiContext) -> Router<ApiContext> {
    let api_router = api_router(context);

    Router::new()
        .nest("/api", api_router)
        .fallback(get(serve_web_site::serve_web_site)) // Handle all non-api/* routes and render the frontend
}

fn api_router(context: &ApiContext) -> Router<ApiContext> {
    Router::new()
        .route("/healthz", get(health::get_app_health::get_app_health))
        .route(
            "/admin/actions/reset",
            post(admin::reset_all::reset_all)
                .layer(from_fn_with_state(context.clone(), auth_admin)),
        )
        .route(
            "/admin/actions/backup_all",
            post(backup::backup_all::backup_all)
                .layer(from_fn_with_state(context.clone(), auth_admin)),
        )
        .route(
            "/sites_metadata/{site_id}",
            patch(
                site::update_site_metadata::update_site_metadata
                    .layer(from_fn_with_state(context.clone(), auth_admin_owner)),
            )
            .get(
                site::get_site_metadata::get_site_metadata
                    .layer(from_fn_with_state(context.clone(), auth_admin)),
            ),
        )
        .route(
            "/sites/{site_id}",
            patch(
                site::update_site::update_site
                    .layer(from_fn_with_state(context.clone(), auth_admin_owner))
                    .layer(from_fn_with_state(context.clone(), error_cache)),
            )
            .delete(
                site::delete_site::delete_site
                    .layer(from_fn_with_state(context.clone(), auth_admin)),
            ),
        )
        .route(
            "/sites/{site_id}/head",
            get(site::get_site_head::get_site_head),
        )
        .route(
            "/sites",
            get(site::list_sites::list_sites)
                .post(site::create_site::create_site)
                .route_layer(from_fn_with_state(context.clone(), auth_admin)),
        )
        .route(
            "/sites/actions/create_from_backup",
            post(site::create_site_from_backup::create_site_from_backup),
        )
        .route(
            "/sites/validate_domain",
            get(site::validate_domain::validate_domain),
        )
        .route(
            "/sites/current",
            get(site::get_current_site::get_current_site),
        )
        .route(
            "/sites/{site_id}/versions/{version_id}",
            get(site::get_site_version::get_site_version)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/versions",
            get(site::list_site_versions::list_site_versions)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/domains",
            get(site::get_site_domains::get_site_domains
                .layer(from_fn_with_state(context.clone(), auth_admin_owner))),
        )
        .route(
            "/sites/{site_id}/actions/publish",
            post(publish::publish_site::publish_site)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/actions/create_draft",
            post(publish::create_draft::create_draft)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/actions/delete_draft",
            delete(publish::delete_draft::delete_draft)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/custom_data",
            post(custom::custom_data::custom_data).route_layer(from_fn_with_state(
                context.clone(),
                auth_admin_owner_anonymous,
            )),
        )
        .route(
            "/sites/{site_id}/backups",
            post(
                backup::create_backup::create_backup
                    .layer(from_fn_with_state(context.clone(), auth_admin)),
            )
            .get(
                backup::list_backups::list_backups
                    .layer(from_fn_with_state(context.clone(), auth_admin_owner)),
            ),
        )
        .route(
            "/sites/{site_id}/backups/{backup_id}",
            delete(backup::delete_backup::delete_backup)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/backups/{backup_id}/actions/restore",
            post(backup::restore_backup::restore_backup)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/usage",
            get(site::get_site_usage::get_site_usage)
                .route_layer(from_fn_with_state(context.clone(), auth_admin_owner)),
        )
        .route(
            "/sites/{site_id}/public_usage",
            get(site::get_site_usage::get_public_site_usage),
        )
        .route(
            "/sites/{site_id}/usage/actions/page_view",
            post(site::record_page_view::record_page_view),
        )
        .route(
            "/actions/persist-usage",
            get(usage::persist_usage::persist_usage),
        )
        .route(
            "/actions/reset-cache",
            get(usage::reset_cache::reset_cache
                .layer(from_fn_with_state(context.clone(), auth_admin))),
        )
        .route("/{*path}", get(handler_400)) // Handle unknown routes under /api
}

async fn handler_400() -> impl IntoResponse {
    (StatusCode::BAD_REQUEST, "Invalid API endpoint")
}
