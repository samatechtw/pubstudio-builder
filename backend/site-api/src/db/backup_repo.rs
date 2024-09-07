use axum::async_trait;
use chrono::{DateTime, Utc};
use lib_shared_types::entity::site_api::backup_entity::{BackupEntity, CreateBackupEntityResult};
use sqlx::{sqlite::SqliteRow, Error, Row, SqlitePool};
use std::sync::Arc;
use uuid::Uuid;

use super::site_db_pool_manager::SqlitePoolConnection;

pub type DynBackupRepo = Arc<dyn BackupRepoTrait + Send + Sync>;

pub struct BackupEntityProps {
    pub site_id: Uuid,
    pub url: String,
    // Manually insert created_at to match S3 object key, which is created first
    pub created_at: DateTime<Utc>,
}

#[async_trait]
pub trait BackupRepoTrait {
    async fn get_db_conn(&self) -> Result<SqlitePoolConnection, Error>;
    async fn create_backup(
        &self,
        props: BackupEntityProps,
    ) -> Result<CreateBackupEntityResult, Error>;
    async fn list_backups_by_site_id(&self, site_id: &str) -> Result<Vec<BackupEntity>, Error>;
    async fn list_backups_after(
        &self,
        site_id: &str,
        offset: i32,
    ) -> Result<Vec<BackupEntity>, Error>;
    async fn delete_backup(&self, id: u32) -> Result<(), Error>;
    async fn get_backup(&self, id: u32) -> Result<BackupEntity, Error>;
}

pub struct BackupRepo {
    pub metadata_db_pool: SqlitePool,
}

fn row_to_site_metadata(row: SqliteRow) -> Result<BackupEntity, Error> {
    Ok(BackupEntity {
        id: row.try_get("id")?,
        site_id: row.try_get("site_id")?,
        url: row.try_get("url")?,
        created_at: row.try_get("created_at")?,
        updated_at: row.try_get("updated_at")?,
    })
}

fn row_to_create_result(row: SqliteRow) -> Result<CreateBackupEntityResult, Error> {
    Ok(CreateBackupEntityResult {
        id: row.try_get("id")?,
        site_id: row.try_get("site_id")?,
        url: row.try_get("url")?,
        count: row.try_get("count")?,
    })
}

#[async_trait]
impl BackupRepoTrait for BackupRepo {
    async fn get_db_conn(&self) -> Result<SqlitePoolConnection, Error> {
        return Ok(self.metadata_db_pool.acquire().await?);
    }

    async fn list_backups_by_site_id(&self, site_id: &str) -> Result<Vec<BackupEntity>, Error> {
        let sites: Vec<BackupEntity> = sqlx::query(
            r#"
        SELECT id, site_id, url, created_at, updated_at
        FROM backups
        WHERE site_id = ?1
        ORDER BY id
    "#,
        )
        .bind(site_id)
        .try_map(row_to_site_metadata)
        .fetch_all(&mut *self.get_db_conn().await?)
        .await?;
        Ok(sites)
    }

    async fn list_backups_after(
        &self,
        site_id: &str,
        offset: i32,
    ) -> Result<Vec<BackupEntity>, Error> {
        let sites: Vec<BackupEntity> = sqlx::query(
            r#"
        SELECT id, site_id, url, created_at, updated_at
        FROM backups
        WHERE site_id = ?1
        ORDER BY created_at
        OFFSET ?2
    "#,
        )
        .bind(site_id)
        .bind(offset)
        .try_map(row_to_site_metadata)
        .fetch_all(&mut *self.get_db_conn().await?)
        .await?;
        Ok(sites)
    }

    async fn create_backup(
        &self,
        props: BackupEntityProps,
    ) -> Result<CreateBackupEntityResult, Error> {
        let backup: CreateBackupEntityResult = sqlx::query(
            r#"
          INSERT INTO backups(site_id, url, created_at)
          VALUES (?1, ?2, ?3)
          RETURNING id, site_id, url, (SELECT COUNT(*) FROM backups where site_id = ?1) as count
        "#,
        )
        .bind(props.site_id.to_string())
        .bind(props.url)
        .bind(props.created_at)
        .try_map(row_to_create_result)
        .fetch_one(&mut *self.get_db_conn().await?)
        .await?;

        Ok(backup)
    }

    async fn delete_backup(&self, id: u32) -> Result<(), Error> {
        sqlx::query(
            r#"
            DELETE FROM backups WHERE id = ?
        "#,
        )
        .bind(id)
        .execute(&mut *self.get_db_conn().await?)
        .await?;

        Ok(())
    }

    async fn get_backup(&self, id: u32) -> Result<BackupEntity, Error> {
        let backup: BackupEntity = sqlx::query(
            r#"
            SELECT * FROM backups WHERE id = ?
        "#,
        )
        .bind(id)
        .try_map(row_to_site_metadata)
        .fetch_one(&mut *self.get_db_conn().await?)
        .await?;

        Ok(backup)
    }
}
