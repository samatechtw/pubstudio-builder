use axum::async_trait;
use const_format::formatcp;
use lib_shared_site_api::db::{db_error::DbError, util::append_comma};
use lib_shared_types::{
    dto::{
        query_dto::ListQuery,
        site_api::{
            create_site_dto::CreateSiteDto, publish_site_dto::PublishSiteDto,
            update_site_dto::UpdateSiteDto,
        },
    },
    entity::site_api::site_entity::SiteEntity,
};
use sqlx::{
    migrate::MigrateDatabase,
    sqlite::{SqlitePoolOptions, SqliteRow},
    Error, QueryBuilder, Row, SqlitePool,
};
use std::{
    collections::HashMap,
    fs::{self, File},
    io::Write,
    sync::Arc,
};
use tokio::sync::RwLock;

pub type SiteDbPools = RwLock<HashMap<String, SqlitePool>>;

pub type DynSiteRepo = Arc<dyn SiteRepoTrait + Send + Sync>;

const SITE_COLUMNS: &str = r#"id, name, version, context, defaults, editor, history, pages, created_at, updated_at, published"#;

#[async_trait]
pub trait SiteRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn create_db(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn delete_site(&self, id: &str) -> Result<(), DbError>;
    async fn create_site(&self, req: CreateSiteDto) -> Result<SiteEntity, DbError>;
    async fn get_site_latest_version(&self, id: &str) -> Result<SiteEntity, DbError>;
    async fn get_site_by_version(&self, id: &str, version_id: &str) -> Result<SiteEntity, DbError>;
    async fn list_site_versions(
        &self,
        id: &str,
        query: ListQuery,
    ) -> Result<Vec<SiteEntity>, DbError>;
    async fn update_site(&self, id: &str, req: UpdateSiteDto) -> Result<SiteEntity, DbError>;
    async fn publish_site(&self, id: &str, req: PublishSiteDto) -> Result<SiteEntity, DbError>;
    async fn export_backup(&self, id: &str) -> Result<(), DbError>;
    async fn import_backup(&self, id: &str, backup_data: Vec<u8>) -> Result<(), DbError>;
}

pub struct SiteRepo {
    pub site_db_pools: SiteDbPools,
    pub manifest_dir: String,
}

#[async_trait]
impl SiteRepoTrait for SiteRepo {
    fn site_db_url(&self, id: &str) -> String {
        format!("sqlite:{}/db/sites/site_{}.db", &self.manifest_dir, id)
    }

    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError> {
        let try_connect;
        {
            let db_pools = self.site_db_pools.read().await;
            if let Some(pool) = db_pools.get(id) {
                if pool.is_closed() {
                    print!("DB pool is closed");
                    try_connect = true;
                } else {
                    return Ok(pool.clone());
                }
            } else {
                try_connect = true;
            }
        }
        // Read lock is released
        if try_connect {
            let mut db_pools = self.site_db_pools.write().await;
            let site_db_url = self.site_db_url(id);

            if let Some(pool) = db_pools.get_mut(id) {
                *pool = SqlitePool::connect(&site_db_url)
                    .await
                    .map_err(|e| DbError::NoDb(e.to_string()))?;
                return Ok(pool.clone());
            } else {
                if let Ok(new_pool) = SqlitePool::connect(&site_db_url).await {
                    db_pools.insert(id.to_string(), new_pool.clone());
                    return Ok(new_pool.clone());
                }
            }
        }
        Err(DbError::NoDb("Failed to get DB pool".into()))
    }

    async fn create_site(&self, req: CreateSiteDto) -> Result<SiteEntity, DbError> {
        let pool = self.create_db(&req.id).await?;

        // Insert site info into sites table
        let site_response = sqlx::query(formatcp!(
            r#"
            INSERT INTO site_versions(name, version, context, defaults, editor, history, pages, published)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
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
        .try_map(map_to_site_entity)
        .fetch_one(&pool)
        .await
        .map_err(|e| DbError::Query(e.to_string()))?;

        Ok(site_response)
    }

    async fn get_site_latest_version(&self, id: &str) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let site = sqlx::query(formatcp!(
            r#"
            SELECT {}
            FROM site_versions
            ORDER BY published DESC, id DESC
        "#,
            SITE_COLUMNS
        ))
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
                r#"
                   SELECT {}
                   FROM site_versions
                   WHERE id = ?
                "#,
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

    async fn update_site(&self, id: &str, req: UpdateSiteDto) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let query = QueryBuilder::new("UPDATE site_versions SET");
        let update_count = 0;

        let (query, update_count) = append_comma(query, "name", req.name, update_count);
        let (query, update_count) = append_comma(query, "version", req.version, update_count);
        let (query, update_count) = append_comma(query, "context", req.context, update_count);
        let (query, update_count) = append_comma(query, "defaults", req.defaults, update_count);
        let (query, update_count) = append_comma(query, "editor", req.editor, update_count);
        let (query, update_count) = append_comma(query, "history", req.history, update_count);
        let (query, update_count) = append_comma(query, "pages", req.pages, update_count);
        let (mut query, update_count) =
            append_comma(query, "published", req.published, update_count);

        if update_count == 0 {
            return Err(DbError::NoUpdate);
        }

        // Update the latest version of the site
        if let Some(update_key) = req.update_key {
            // Append the condition to check the updated_at
            query.push(format!(
                " WHERE id = (SELECT MAX(id) FROM site_versions) AND updated_at = DATETIME('{}')",
                update_key
            ));
        } else {
            query.push(" WHERE id = (SELECT MAX(id) FROM site_versions)");
        }

        query.push(formatcp!(" RETURNING {}", SITE_COLUMNS));

        Ok(query
            .build()
            .try_map(map_to_site_entity)
            .fetch_one(&pool)
            .await
            .map_err(|e| DbError::Query(e.to_string()))?)
    }

    async fn create_db(&self, id: &str) -> Result<SqlitePool, DbError> {
        let site_db_url = self.site_db_url(id);

        // Create new database
        if !sqlx::Sqlite::database_exists(&site_db_url).await? {
            sqlx::Sqlite::create_database(&site_db_url).await?;
        }

        // Connect to the database
        let pool = SqlitePoolOptions::new().connect(&site_db_url).await?;

        // Migrate the database
        sqlx::migrate!("db/sites/migrations")
            .run(&pool)
            .await
            .map_err(|e| DbError::Migrate(e.to_string()))?;

        // Insert the connection pool into the map.
        let mut db_pools = self.site_db_pools.write().await;
        db_pools.insert(id.to_string(), pool.clone());

        Ok(pool)
    }

    async fn delete_site(&self, id: &str) -> Result<(), DbError> {
        let site_db_url = self.site_db_url(id);

        if sqlx::Sqlite::database_exists(&site_db_url).await? {
            // Remove the connection pool from the map
            let mut db_pools = self.site_db_pools.write().await;

            match db_pools.get(id) {
                Some(&ref pool) => {
                    pool.close().await;
                    db_pools.remove(id);
                }
                _ => println!("DB pool not found"),
            }

            // Delete the database
            sqlx::Sqlite::drop_database(&site_db_url).await?;

            Ok(())
        } else {
            Err(DbError::NoDb("Database not found".into()))
        }
    }

    async fn publish_site(&self, id: &str, req: PublishSiteDto) -> Result<SiteEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        // Start an sqlx transaction
        let mut transaction = pool.begin().await?;

        // Set published = false for the current published version (if one exists)
        sqlx::query(
            r#"
               UPDATE site_versions
               SET published = FALSE
               WHERE published = TRUE
            "#,
        )
        .execute(&mut transaction)
        .await?;

        // Set published = true for the specified site_id
        let site = sqlx::query(formatcp!(
            r#"
                UPDATE site_versions
                SET published = true
                WHERE id = ?
                RETURNING {}
            "#,
            SITE_COLUMNS
        ))
        .bind(req.version_id)
        .try_map(map_to_site_entity)
        .fetch_one(&mut transaction)
        .await?;

        // if the latest site version is published, create a new version and copy data from the latest version
        sqlx::query(
            r#"
            INSERT INTO site_versions (name, version, context, defaults, editor, history, pages, published)
            SELECT name, version, context, defaults, editor, history, pages, false
            FROM site_versions
            WHERE id = (
                SELECT MAX(id)
                FROM site_versions
            )
            AND published = true
            "#,
        )
        .execute(&mut transaction)
        .await?;

        // Commit the transaction
        transaction.commit().await?;

        Ok(site)
    }

    async fn list_site_versions(
        &self,
        id: &str,
        query: ListQuery,
    ) -> Result<Vec<SiteEntity>, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result = sqlx::query(formatcp!(
            r#"
                SELECT {}
                FROM site_versions
                ORDER BY id ASC
                LIMIT ? OFFSET ?
            "#,
            SITE_COLUMNS
        ))
        .bind(query.to - query.from + 1)
        .bind(query.from - 1)
        .try_map(map_to_site_entity)
        .fetch_all(&pool)
        .await?;

        Ok(result)
    }

    async fn export_backup(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let backup_file = format!("db/sites/backups/backup_{}.db", id);

        if std::path::Path::new(&backup_file).exists() {
            fs::remove_file(&backup_file).map_err(|e| DbError::FileError(e.to_string()))?;
        }

        let _ = sqlx::query("VACUUM INTO ?1")
            .bind(backup_file)
            .fetch_all(&pool)
            .await?;

        Ok(())
    }

    async fn import_backup(&self, id: &str, backup_data: Vec<u8>) -> Result<(), DbError> {
        // Close the current DB connection/pool
        let mut db_pools = self.site_db_pools.write().await;

        match db_pools.get(id) {
            Some(&ref pool) => {
                pool.close().await;
                db_pools.remove(id);
            }
            _ => println!("DB pool has already been closed"),
        }
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
        db_pools.insert(id.to_string(), pool.clone());

        Ok(())
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
        published: row.try_get("published")?,
    })
}
