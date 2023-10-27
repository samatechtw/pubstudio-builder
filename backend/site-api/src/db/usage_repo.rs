use std::sync::Arc;

use axum::async_trait;
use chrono::Utc;
use lib_shared_site_api::cache::cache::SiteDataCache;
use lib_shared_types::entity::site_api::site_usage_entity::SiteUsageEntity;
use sqlx::{sqlite::SqliteRow, Error, QueryBuilder, Row, Sqlite, SqlitePool};

pub type DynUsageRepo = Arc<dyn UsageRepoTrait + Send + Sync>;

#[async_trait]
pub trait UsageRepoTrait {
    fn get_db_pool(&self) -> &SqlitePool;
    async fn insert_usage(&self, cache: &SiteDataCache) -> Result<(), Error>;
    async fn list_usages_by_site_id(&self, site_id: &str) -> Result<Vec<SiteUsageEntity>, Error>;
    async fn list_latest_usages(&self) -> Result<Vec<SiteUsageEntity>, Error>;
}

pub struct UsageRepo {
    pub metadata_db_pool: SqlitePool,
}

fn map_to_usage_entity(row: SqliteRow) -> Result<SiteUsageEntity, Error> {
    Ok(SiteUsageEntity {
        id: row.try_get("id")?,
        site_id: row.try_get("site_id")?,
        request_count: row.try_get("request_count")?,
        request_error_count: row.try_get("request_error_count")?,
        total_bandwidth: row.try_get("total_bandwidth")?,
        start_time: row.try_get("start_time")?,
        end_time: row.try_get("end_time")?,
    })
}

#[async_trait]
impl UsageRepoTrait for UsageRepo {
    fn get_db_pool(&self) -> &SqlitePool {
        return &self.metadata_db_pool;
    }

    async fn insert_usage(&self, cache: &SiteDataCache) -> Result<(), Error> {
        if cache.entry_count() == 0 {
            return Ok(());
        }
        let mut query_builder: QueryBuilder<Sqlite> =
        QueryBuilder::new("INSERT INTO site_usage(site_id, request_count, request_error_count, total_bandwidth, start_time, end_time) ");
        query_builder.push_values(cache.iter(), |mut b, (site_id, site_data)| {
            b.push_bind(site_id.to_string())
                .push_bind(site_data.request_count.to_string())
                .push_bind(site_data.request_error_count.to_string())
                .push_bind(site_data.total_bandwidth.to_string())
                .push_bind(site_data.last_updated.timestamp)
                .push_bind(Utc::now());
        });

        query_builder.build().execute(self.get_db_pool()).await?;

        Ok(())
    }

    async fn list_usages_by_site_id(&self, site_id: &str) -> Result<Vec<SiteUsageEntity>, Error> {
        let entity: Vec<SiteUsageEntity> = sqlx::query(
            r#"
          SELECT * FROM site_usage WHERE site_id = ?
        "#,
        )
        .bind(site_id)
        .try_map(map_to_usage_entity)
        .fetch_all(self.get_db_pool())
        .await?;

        Ok(entity)
    }

    async fn list_latest_usages(&self) -> Result<Vec<SiteUsageEntity>, Error> {
        let entity: Vec<SiteUsageEntity> = sqlx::query(
            r#"
          SELECT * FROM site_usage
          WHERE (site_id, end_time) IN (
            SELECT site_id, MAX(end_time)
            FROM site_usage
            GROUP BY site_id
        )
        "#,
        )
        .try_map(map_to_usage_entity)
        .fetch_all(self.get_db_pool())
        .await?;

        Ok(entity)
    }
}
