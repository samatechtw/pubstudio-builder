use axum::async_trait;
use chrono::Utc;
use const_format::formatcp;
use lib_shared_site_api::db::{
    db_error::{map_sqlx_err, DbError},
    util::{append_comma, append_nullable_comma},
};
use lib_shared_types::{
    dto::{
        query_dto::ListQuery,
        site_api::{
            create_site_dto::CreateSiteDto, update_site_dto::UpdateSiteDtoWithContentUpdatedAt,
        },
    },
    entity::site_api::{
        site_entity::SiteEntity, site_info_entity::SiteInfoEntity,
        site_metadata_entity::SiteMetadataEntity,
    },
};
use sqlx::{
    migrate::MigrateDatabase,
    sqlite::{SqlitePoolOptions, SqliteRow},
    Error, QueryBuilder, Row, SqlitePool,
};
use std::{
    fs::{self, File},
    io::Write,
    sync::Arc,
};

use uuid::Uuid;

use super::site_db_pool_manager::DbPoolManager;

pub type DynSiteRepo = Arc<dyn SiteRepoTrait + Send + Sync>;

const SITE_COLUMNS: &str = r#"id, name, version, context, defaults, editor, history, pages, created_at, updated_at, content_updated_at, published, preview_id"#;
const SITE_INFO_COLUMNS: &str = r#"id, name, updated_at, published"#;

#[async_trait]
pub trait SiteRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn create_db(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn delete_site(&self, id: &str) -> Result<(), DbError>;
    async fn create_site(&self, req: CreateSiteDto) -> Result<SiteEntity, DbError>;
    async fn migrate_db(&self, pool: &SqlitePool) -> Result<(), DbError>;
    async fn migrate_all(&self, sites: Vec<SiteMetadataEntity>) -> Result<(), DbError>;
    async fn get_site_latest_version(
        &self,
        id: &str,
        published: bool,
    ) -> Result<SiteEntity, DbError>;
    async fn get_site_by_version(&self, id: &str, version_id: &str) -> Result<SiteEntity, DbError>;
    async fn get_site_by_preview_id(
        &self,
        id: &str,
        preview_id: &str,
    ) -> Result<SiteEntity, DbError>;
    async fn list_site_versions(
        &self,
        id: &str,
        query: ListQuery,
    ) -> Result<Vec<SiteInfoEntity>, DbError>;
    async fn update_site(
        &self,
        id: &str,
        req: UpdateSiteDtoWithContentUpdatedAt,
    ) -> Result<SiteEntity, DbError>;
    async fn create_draft(&self, id: &str, from_id: i64) -> Result<(), DbError>;
    async fn delete_draft(&self, id: &str) -> Result<(), DbError>;
    async fn publish_site(&self, id: &str) -> Result<SiteEntity, DbError>;
    async fn publish_all_versions(&self, id: &str, published: bool) -> Result<(), DbError>;
    async fn export_backup(&self, id: &str) -> Result<Vec<u8>, DbError>;
    async fn import_backup(&self, id: &str, backup_data: Vec<u8>) -> Result<(), DbError>;
}

pub struct SiteRepo {
    pub db_pool_manager: DbPoolManager,
    pub manifest_dir: String,
}

#[async_trait]
impl SiteRepoTrait for SiteRepo {
    fn site_db_url(&self, id: &str) -> String {
        format!("sqlite:{}/db/sites/site_{}.db", &self.manifest_dir, id)
    }

    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError> {
        self.db_pool_manager
            .get_db_pool(id, &self.manifest_dir)
            .await
    }

    async fn create_site(&self, req: CreateSiteDto) -> Result<SiteEntity, DbError> {
        let pool = self.create_db(&req.id).await?;

        // Insert site info into sites table
        let site_response = sqlx::query(formatcp!(
            r#"
            INSERT INTO site_versions(name, version, context, defaults, editor, history, pages, published, content_updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            RETURNING {}
        "#,
            SITE_COLUMNS
        ))
        .bind(req.name)
        .bind(req.version)
        .bind(req.context)
        .bind(req.defaults)
        .bind(req.editor)
        .bind(req.history)
        .bind(req.pages)
        .bind(req.published)
        .bind(Utc::now().timestamp_millis())
        .try_map(map_to_site_entity)
        .fetch_one(&pool)
        .await
        .map_err(|e| DbError::Query(e.to_string()))?;

        Ok(site_response)
    }

    async fn get_site_latest_version(
        &self,
        id: &str,
        published: bool,
    ) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let query = if published {
            formatcp!(
                r#" SELECT {} FROM site_versions ORDER BY published DESC, id DESC"#,
                SITE_COLUMNS
            )
        } else {
            formatcp!(
                r#" SELECT {} FROM site_versions ORDER BY id DESC"#,
                SITE_COLUMNS
            )
        };

        let site = sqlx::query(query)
            .try_map(map_to_site_entity)
            .fetch_one(&pool)
            .await
            .map_err(|e| DbError::Query(e.to_string()))?;

        Ok(site)
    }

    async fn get_site_by_version(&self, id: &str, version_id: &str) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let version_id_result = version_id.parse::<i64>();

        match version_id_result {
            Ok(version_id) => Ok(sqlx::query(formatcp!(
                r#"SELECT {} FROM site_versions WHERE id = ?"#,
                SITE_COLUMNS
            ))
            .bind(version_id)
            .try_map(map_to_site_entity)
            .fetch_one(&pool)
            .await
            .map_err(|e| DbError::Query(e.to_string()))?),
            Err(e) => Err(DbError::Query(e.to_string())),
        }
    }

    async fn get_site_by_preview_id(
        &self,
        id: &str,
        preview_id: &str,
    ) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        Ok(sqlx::query(formatcp!(
            r#"SELECT {} FROM site_versions WHERE preview_id = ?"#,
            SITE_COLUMNS
        ))
        .bind(preview_id)
        .try_map(map_to_site_entity)
        .fetch_one(&pool)
        .await
        .map_err(|e| DbError::Query(e.to_string()))?)
    }

    async fn update_site(
        &self,
        id: &str,
        req: UpdateSiteDtoWithContentUpdatedAt,
    ) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let query = QueryBuilder::new("UPDATE site_versions SET");
        let update_count = 0;

        let (query, update_count) = append_comma(query, "name", req.dto.name, update_count);
        let (query, update_count) = append_comma(query, "version", req.dto.version, update_count);
        let (query, update_count) = append_comma(query, "context", req.dto.context, update_count);
        let (query, update_count) = append_comma(query, "defaults", req.dto.defaults, update_count);
        let (query, update_count) = append_comma(query, "editor", req.dto.editor, update_count);
        let (query, update_count) = append_comma(query, "history", req.dto.history, update_count);
        let (query, update_count) = append_comma(query, "pages", req.dto.pages, update_count);
        let (query, update_count) = append_comma(
            query,
            "content_updated_at",
            req.content_updated_at,
            update_count,
        );
        let (mut query, update_count) = if let Some(enable_preview) = req.dto.enable_preview {
            let preview_id = if enable_preview {
                Some(Uuid::new_v4().to_string())
            } else {
                None
            };
            append_nullable_comma(query, "preview_id", preview_id, update_count)
        } else {
            (query, update_count)
        };

        if update_count == 0 {
            return Err(DbError::NoUpdate);
        }

        query.push(" WHERE id = (SELECT MAX(id) FROM site_versions)");
        // Update the latest version of the site
        if let Some(update_key) = req.dto.update_key {
            // Append the condition to check content_updated_at
            query.push(" AND updated_at = DATETIME(");
            query.push_bind(update_key);
            query.push(")");
        }

        query.push(formatcp!(" RETURNING {}", SITE_COLUMNS));

        Ok(query
            .build()
            .try_map(map_to_site_entity)
            .fetch_one(&pool)
            .await
            .map_err(map_sqlx_err)?)
    }

    async fn create_db(&self, id: &str) -> Result<SqlitePool, DbError> {
        let site_db_url = self.site_db_url(id);

        // Create new database
        if !sqlx::Sqlite::database_exists(&site_db_url).await? {
            sqlx::Sqlite::create_database(&site_db_url).await?;
        }

        // Connect to the database
        let pool = SqlitePoolOptions::new().connect(&site_db_url).await?;

        // Insert the connection pool into the map.
        self.db_pool_manager
            .insert_db_pool(id, pool.clone())
            .await?;

        self.migrate_db(&pool).await?;

        Ok(pool)
    }

    async fn migrate_db(&self, pool: &SqlitePool) -> Result<(), DbError> {
        // Migrate the database
        sqlx::migrate!("db/sites/migrations")
            .run(pool)
            .await
            .map_err(|e| DbError::Migrate(e.to_string()))?;
        Ok(())
    }

    async fn migrate_all(&self, sites: Vec<SiteMetadataEntity>) -> Result<(), DbError> {
        for site in sites {
            let pool = self.get_db_pool(&site.id).await?;
            if let Err(e) = self.migrate_db(&pool).await {
                println!("Failed to migrate site: {}", e.to_string());
            }
        }
        Ok(())
    }

    async fn delete_site(&self, id: &str) -> Result<(), DbError> {
        let site_db_url = self.site_db_url(id);

        if sqlx::Sqlite::database_exists(&site_db_url).await? {
            // Remove the connection pool from the map
            self.db_pool_manager.remove_db_pool(id).await?;

            // Delete the database
            sqlx::Sqlite::drop_database(&site_db_url).await?;

            Ok(())
        } else {
            Err(DbError::NoDb("Database not found".into()))
        }
    }

    async fn create_draft(&self, id: &str, from_id: i64) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        sqlx::query(
            r#"INSERT INTO site_versions (name, version, context, defaults, editor, history, pages, content_updated_at)
            SELECT name, version, context, defaults, editor, history, pages, content_updated_at FROM site_versions WHERE id = ?
            "#,
        )
        .bind(from_id)
        .execute(&pool)
        .await?;

        Ok(())
    }

    async fn delete_draft(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        sqlx::query(
            r#"
               DELETE FROM site_versions
               WHERE id = (SELECT MAX(id) FROM site_versions)
            "#,
        )
        .execute(&pool)
        .await?;

        Ok(())
    }

    async fn publish_all_versions(&self, id: &str, published: bool) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        sqlx::query(
            r#"
               UPDATE site_versions
               SET published = ?
            "#,
        )
        .bind(published)
        .execute(&pool)
        .await?;
        Ok(())
    }

    async fn publish_site(&self, id: &str) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let mut sites = sqlx::query(formatcp!(
            r#"
            SELECT {}
            FROM site_versions
            ORDER BY id DESC
            LIMIT 2
        "#,
            SITE_COLUMNS
        ))
        .try_map(map_to_site_entity)
        .fetch_all(&pool)
        .await
        .map_err(|e| DbError::Query(e.to_string()))?
        .into_iter();
        if sites.len() < 2 {
            return Err(DbError::EntityNotFound());
        }
        let draft = sites.next().ok_or(DbError::EntityNotFound())?;
        let published_site = sites.next().ok_or(DbError::EntityNotFound())?;

        let query = QueryBuilder::new("UPDATE site_versions SET");
        let update_count = 0;

        let (query, update_count) =
            append_comma(query, "version", Some(draft.version), update_count);
        let (query, update_count) =
            append_comma(query, "context", Some(draft.context), update_count);
        let (query, update_count) =
            append_comma(query, "defaults", Some(draft.defaults), update_count);
        let (query, update_count) = append_comma(query, "editor", Some(draft.editor), update_count);
        let (query, update_count) =
            append_comma(query, "history", Some(draft.history), update_count);
        let (query, update_count) = append_comma(query, "pages", Some(draft.pages), update_count);
        let (query, update_count) = append_comma(query, "published", Some(true), update_count);
        let (mut query, update_count) = append_comma(
            query,
            "content_updated_at",
            Some(draft.content_updated_at),
            update_count,
        );

        if update_count == 0 {
            return Err(DbError::NoUpdate);
        }

        query.push(" WHERE id = ");
        query.push_bind(published_site.id);
        query.push(formatcp!(" RETURNING {}", SITE_COLUMNS));

        Ok(query
            .build()
            .try_map(map_to_site_entity)
            .fetch_one(&pool)
            .await
            .map_err(map_sqlx_err)?)
    }

    async fn list_site_versions(
        &self,
        id: &str,
        query: ListQuery,
    ) -> Result<Vec<SiteInfoEntity>, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result = sqlx::query(formatcp!(
            r#"
                SELECT {}
                FROM site_versions
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            "#,
            SITE_INFO_COLUMNS
        ))
        .bind(query.to - query.from + 1)
        .bind(query.from - 1)
        .try_map(map_site_info_entity)
        .fetch_all(&pool)
        .await?;

        Ok(result)
    }

    async fn export_backup(&self, id: &str) -> Result<Vec<u8>, DbError> {
        let pool = self.get_db_pool(id).await?;

        let backup_file = format!("db/sites/backups/backup_{}.db", id);

        if std::path::Path::new(&backup_file).exists() {
            fs::remove_file(&backup_file).map_err(|e| DbError::FileError(e.to_string()))?;
        }

        let _ = sqlx::query("VACUUM INTO ?1")
            .bind(&backup_file)
            .fetch_all(&pool)
            .await?;

        let file_content = fs::read(backup_file).map_err(|e| DbError::FileError(e.to_string()))?;

        Ok(file_content)
    }

    async fn import_backup(&self, id: &str, backup_data: Vec<u8>) -> Result<(), DbError> {
        // Close the current DB connection/pool
        self.db_pool_manager.remove_db_pool(id).await?;

        // Replace the database file
        let backup_file = format!("db/sites/site_{}.db", id);
        let mut file = File::create(&backup_file).map_err(|e| DbError::FileError(e.to_string()))?;
        file.write_all(&backup_data)
            .map_err(|e| DbError::FileError(e.to_string()))?;
        file.sync_all()
            .map_err(|e| DbError::FileError(e.to_string()))?;

        // Create new DB pool
        let site_db_url = self.site_db_url(id);
        let pool = SqlitePoolOptions::new().connect(&site_db_url).await?;
        self.db_pool_manager
            .insert_db_pool(id, pool.clone())
            .await?;

        // Run migrations in case a new one was added since the snapshot was saved
        Ok(self.migrate_db(&pool).await?)
    }
}

fn map_to_site_entity(row: SqliteRow) -> Result<SiteEntity, Error> {
    Ok(SiteEntity {
        id: row.try_get("id")?,
        name: row.try_get("name")?,
        version: row.try_get("version")?,
        context: row.try_get("context")?,
        defaults: row.try_get("defaults")?,
        editor: row.try_get("editor")?,
        history: row.try_get("history")?,
        pages: row.try_get("pages")?,
        created_at: row.try_get("created_at")?,
        updated_at: row.try_get("updated_at")?,
        content_updated_at: row.try_get("content_updated_at")?,
        published: row.try_get("published")?,
        preview_id: row.try_get_unchecked("preview_id")?,
    })
}

fn map_site_info_entity(row: SqliteRow) -> Result<SiteInfoEntity, Error> {
    Ok(SiteInfoEntity {
        id: row.try_get("id")?,
        name: row.try_get("name")?,
        updated_at: row.try_get("updated_at")?,
        published: row.try_get("published")?,
    })
}
