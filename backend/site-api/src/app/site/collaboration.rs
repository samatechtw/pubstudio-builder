use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension, Json,
};
use chrono::{DateTime, Utc};
use lib_command_replay::{
    encode_stored_value, has_content_changes, replay_batch, AcceptedOperation, CommandBatch,
    OperationsResponse, ReplayError, StoredSiteDocument, SubmitBatchResponse,
};
use lib_shared_site_api::{
    error::api_error::ApiError, util::json_extractor::PsJson,
    validator::site_data_len_validator::SiteDataValidator,
};
use lib_shared_types::shared::user::{RequestUser, UserType};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqliteRow, Connection, Row, Sqlite};

use crate::{
    api_context::ApiContext, app::ssg::generate_static::spawn_regenerate_static_pages,
    middleware::auth::verify_site_owner,
};

#[derive(Deserialize)]
pub struct OperationsQuery {
    #[serde(default)]
    after_revision: i64,
}

#[derive(Serialize)]
struct CollaborationError {
    code: &'static str,
    status: u16,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    conflict: Option<lib_command_replay::ReplayConflict>,
}

pub async fn submit_operations(
    Path(site_id): Path<String>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
    PsJson(batch): PsJson<CommandBatch>,
) -> Response {
    match submit_operations_result(&site_id, &context, &user, batch).await {
        Ok((response, published, content_changed, site_size, site_type)) => {
            context.cache.remove_site(&site_id).await;
            context.cache.sync().await;
            context
                .cache
                .create_or_update_usage(&site_id, site_size, site_type)
                .await;
            if published && content_changed {
                spawn_regenerate_static_pages(
                    &context,
                    &site_id,
                    Some(response.content_updated_at),
                );
            }
            (StatusCode::OK, Json(response)).into_response()
        }
        Err(response) => response,
    }
}

async fn submit_operations_result(
    site_id: &str,
    context: &ApiContext,
    user: &RequestUser,
    batch: CommandBatch,
) -> Result<
    (
        SubmitBatchResponse,
        bool,
        bool,
        u64,
        lib_shared_types::shared::site::SiteType,
    ),
    Response,
> {
    verify_site_owner(context, user, site_id)
        .await
        .map_err(IntoResponse::into_response)?;
    let metadata = context
        .metadata_repo
        .get_site_metadata(site_id)
        .await
        .map_err(|error| ApiError::not_found().message(error).into_response())?;
    if metadata.disabled && user.user_type != UserType::Admin && user.user_type != UserType::Cron {
        return Err(ApiError::forbidden().into_response());
    }

    let mut connection = context
        .site_repo
        .get_db_conn(site_id)
        .await
        .map_err(internal_error)?;
    let mut tx = connection
        .begin_with("BEGIN IMMEDIATE")
        .await
        .map_err(internal_error)?;
    let row = sqlx::query(
        r#"SELECT id, name, version, context, defaults, pages, page_order,
                  content_updated_at, revision, published
           FROM site_versions ORDER BY id DESC LIMIT 1"#,
    )
    .fetch_optional(tx.as_mut())
    .await
    .map_err(internal_error)?
    .ok_or_else(|| ApiError::not_found().into_response())?;
    let version_id: i64 = row.try_get("id").map_err(internal_error)?;

    if let Some(operation) = find_operation(&mut tx, version_id, &batch.batch_id)
        .await
        .map_err(internal_error)?
    {
        let content_updated_at = row.try_get("content_updated_at").map_err(internal_error)?;
        let published = row.try_get("published").map_err(internal_error)?;
        let site_size = stored_size(&row)?;
        tx.commit().await.map_err(internal_error)?;
        return Ok((
            SubmitBatchResponse {
                operation,
                changed: false,
                duplicate: true,
                content_updated_at,
            },
            published,
            false,
            site_size,
            metadata.site_type,
        ));
    }

    let revision: i64 = row.try_get("revision").map_err(internal_error)?;
    if batch.base_revision > revision {
        return Err(collaboration_error(
            StatusCode::CONFLICT,
            "CollaborationConflict",
            "base_revision is newer than the canonical site",
            None,
        ));
    }
    let document = StoredSiteDocument::from_stored(
        row.try_get("name").map_err(internal_error)?,
        row.try_get("version").map_err(internal_error)?,
        row.try_get("context").map_err(internal_error)?,
        row.try_get("defaults").map_err(internal_error)?,
        row.try_get("pages").map_err(internal_error)?,
        row.try_get("page_order").map_err(internal_error)?,
    )
    .map_err(internal_error)?;
    let replayed = replay_batch(&document, &batch).map_err(replay_error)?;
    let validator = SiteDataValidator::new(metadata.site_type);
    validator
        .validate_context(&replayed.document.context)
        .and_then(|_| validator.validate_pages(&replayed.document.pages))
        .map_err(IntoResponse::into_response)?;

    let context_json = encode_stored_value(&replayed.document.context).map_err(internal_error)?;
    let defaults_json = encode_stored_value(&replayed.document.defaults).map_err(internal_error)?;
    let pages_json = encode_stored_value(&replayed.document.pages).map_err(internal_error)?;
    let page_order_json =
        encode_stored_value(&replayed.document.page_order).map_err(internal_error)?;
    let next_revision = revision + 1;
    let content_changed = replayed.changed && has_content_changes(&batch.commands);
    let previous_content_updated_at: i64 =
        row.try_get("content_updated_at").map_err(internal_error)?;
    let content_updated_at = if content_changed {
        Utc::now().timestamp_millis()
    } else {
        previous_content_updated_at
    };
    let name = replayed.document.name_string().map_err(replay_error)?;
    let version = replayed.document.version_string().map_err(replay_error)?;
    sqlx::query(
        r#"UPDATE site_versions
           SET name = ?, version = ?, context = ?, defaults = ?, pages = ?, page_order = ?,
               revision = ?, content_updated_at = ?
           WHERE id = ?"#,
    )
    .bind(&name)
    .bind(&version)
    .bind(&context_json)
    .bind(&defaults_json)
    .bind(&pages_json)
    .bind(&page_order_json)
    .bind(next_revision)
    .bind(content_updated_at)
    .bind(version_id)
    .execute(tx.as_mut())
    .await
    .map_err(internal_error)?;

    let commands = serde_json::to_string(&batch.commands).map_err(internal_error)?;
    let author_id = user.user_id.map(|id| id.to_string());
    let inserted = sqlx::query(
        r#"INSERT INTO site_operations
             (site_version_id, revision, batch_id, client_id, protocol_version,
              base_revision, commands, author_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           RETURNING revision, protocol_version, batch_id, client_id, base_revision,
                     commands, author_id, created_at"#,
    )
    .bind(version_id)
    .bind(next_revision)
    .bind(&batch.batch_id)
    .bind(&batch.client_id)
    .bind(batch.protocol_version)
    .bind(batch.base_revision)
    .bind(commands)
    .bind(author_id)
    .fetch_one(tx.as_mut())
    .await
    .map_err(internal_error)?;
    let operation = map_operation(&inserted).map_err(internal_error)?;
    let published = row.try_get("published").map_err(internal_error)?;
    let site_size = (context_json.len() + defaults_json.len() + pages_json.len()) as u64;
    tx.commit().await.map_err(internal_error)?;

    Ok((
        SubmitBatchResponse {
            operation,
            changed: replayed.changed,
            duplicate: false,
            content_updated_at,
        },
        published,
        content_changed,
        site_size,
        metadata.site_type,
    ))
}

pub async fn get_operations(
    Path(site_id): Path<String>,
    Query(query): Query<OperationsQuery>,
    State(context): State<ApiContext>,
    Extension(user): Extension<RequestUser>,
) -> Result<Json<OperationsResponse>, ApiError> {
    verify_site_owner(&context, &user, &site_id).await?;
    let mut connection = context
        .site_repo
        .get_db_conn(&site_id)
        .await
        .map_err(|error| ApiError::not_found().message(error))?;
    let site = sqlx::query(
        "SELECT id, revision, content_updated_at FROM site_versions ORDER BY id DESC LIMIT 1",
    )
    .fetch_one(&mut *connection)
    .await
    .map_err(|error| ApiError::not_found().message(error))?;
    let version_id: i64 = site
        .try_get("id")
        .map_err(|error| ApiError::internal_error().message(error))?;
    let current_revision: i64 = site
        .try_get("revision")
        .map_err(|error| ApiError::internal_error().message(error))?;
    let content_updated_at: i64 = site
        .try_get("content_updated_at")
        .map_err(|error| ApiError::internal_error().message(error))?;
    let rows = sqlx::query(
        r#"SELECT revision, protocol_version, batch_id, client_id, base_revision,
                  commands, author_id, created_at
           FROM site_operations
           WHERE site_version_id = ? AND revision > ?
           ORDER BY revision ASC LIMIT 1000"#,
    )
    .bind(version_id)
    .bind(query.after_revision.max(0))
    .fetch_all(&mut *connection)
    .await
    .map_err(|error| ApiError::internal_error().message(error))?;
    let operations = rows
        .iter()
        .map(map_operation)
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| ApiError::internal_error().message(error))?;
    Ok(Json(OperationsResponse {
        current_revision,
        operation_floor: 0,
        content_updated_at,
        operations,
        snapshot_required: false,
    }))
}

async fn find_operation(
    tx: &mut sqlx::Transaction<'_, Sqlite>,
    version_id: i64,
    batch_id: &str,
) -> Result<Option<AcceptedOperation>, sqlx::Error> {
    sqlx::query(
        r#"SELECT revision, protocol_version, batch_id, client_id, base_revision,
                  commands, author_id, created_at
           FROM site_operations
           WHERE site_version_id = ? AND batch_id = ?"#,
    )
    .bind(version_id)
    .bind(batch_id)
    .fetch_optional(tx.as_mut())
    .await?
    .as_ref()
    .map(map_operation)
    .transpose()
}

fn map_operation(row: &SqliteRow) -> Result<AcceptedOperation, sqlx::Error> {
    let protocol_version: i64 = row.try_get("protocol_version")?;
    let commands: String = row.try_get("commands")?;
    let created_at: DateTime<Utc> = row.try_get("created_at")?;
    Ok(AcceptedOperation {
        revision: row.try_get("revision")?,
        protocol_version: u16::try_from(protocol_version).unwrap_or_default(),
        batch_id: row.try_get("batch_id")?,
        client_id: row.try_get("client_id")?,
        base_revision: row.try_get("base_revision")?,
        commands: serde_json::from_str(&commands)
            .map_err(|error| sqlx::Error::Decode(error.into()))?,
        author_id: row.try_get("author_id")?,
        created_at: created_at.to_rfc3339(),
    })
}

fn stored_size(row: &SqliteRow) -> Result<u64, Response> {
    let context: String = row.try_get("context").map_err(internal_error)?;
    let defaults: String = row.try_get("defaults").map_err(internal_error)?;
    let pages: String = row.try_get("pages").map_err(internal_error)?;
    Ok((context.len() + defaults.len() + pages.len()) as u64)
}

fn replay_error(error: ReplayError) -> Response {
    match error {
        ReplayError::Conflict(conflict) => {
            let message = conflict.reason.clone();
            collaboration_error(
                StatusCode::CONFLICT,
                "CollaborationConflict",
                &message,
                Some(conflict),
            )
        }
        ReplayError::UnsupportedProtocol(version) => collaboration_error(
            StatusCode::UPGRADE_REQUIRED,
            "ClientUpgradeRequired",
            &format!("unsupported collaboration protocol version {version}"),
            None,
        ),
        other => collaboration_error(
            StatusCode::BAD_REQUEST,
            "InvalidCollaborationBatch",
            &other.to_string(),
            None,
        ),
    }
}

fn collaboration_error(
    status: StatusCode,
    code: &'static str,
    message: &str,
    conflict: Option<lib_command_replay::ReplayConflict>,
) -> Response {
    (
        status,
        Json(CollaborationError {
            code,
            status: status.as_u16(),
            message: message.into(),
            conflict,
        }),
    )
        .into_response()
}

fn internal_error(error: impl std::fmt::Display) -> Response {
    ApiError::internal_error().message(error).into_response()
}
