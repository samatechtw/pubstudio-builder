use std::sync::Arc;

use async_trait::async_trait;
use chrono::Utc;
use lib_shared_site_api::cache::cache::SiteUsageCache;
use lib_shared_types::entity::site_api::site_usage_entity::{SiteUsageEntity, SiteUsageTotals};
use sqlx::{sqlite::SqliteRow, Error, QueryBuilder, Row, Sqlite, SqlitePool};

use super::site_db_pool_manager::SqlitePoolConnection;

pub type DynUsageRepo = Arc<dyn UsageRepoTrait + Send + Sync>;

#[async_trait]
pub trait UsageRepoTrait {
    async fn get_db_conn(&self) -> Result<SqlitePoolConnection, Error>;
    async fn insert_usage(&self, cache: &SiteUsageCache) -> Result<(), Error>;
    async fn list_usages_by_site_id(&self, site_id: &str) -> Result<Vec<SiteUsageEntity>, Error>;
    async fn list_latest_usages(&self) -> Result<Vec<SiteUsageEntity>, Error>;
    async fn list_usage_totals(&self) -> Result<Vec<SiteUsageTotals>, Error>;
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

fn map_to_usage_totals(row: SqliteRow) -> Result<SiteUsageTotals, Error> {
    Ok(SiteUsageTotals {
        id: row.try_get("id")?,
        site_id: row.try_get("site_id")?,
        total_request_count: row.try_get("total_request_count")?,
        current_monthly_bandwidth: row.try_get("current_monthly_bandwidth")?,
    })
}

#[async_trait]
impl UsageRepoTrait for UsageRepo {
    async fn get_db_conn(&self) -> Result<SqlitePoolConnection, Error> {
        return Ok(self.metadata_db_pool.acquire().await?);
    }

    async fn insert_usage(&self, cache: &SiteUsageCache) -> Result<(), Error> {
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

        query_builder
            .build()
            .execute(&mut *self.get_db_conn().await?)
            .await?;

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
        .fetch_all(&mut *self.get_db_conn().await?)
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
        .fetch_all(&mut *self.get_db_conn().await?)
        .await?;

        Ok(entity)
    }

    async fn list_usage_totals(&self) -> Result<Vec<SiteUsageTotals>, Error> {
        let entity: Vec<SiteUsageTotals> = sqlx::query(
            r#"
            SELECT
              id,
              site_id,
              SUM(request_count) AS total_request_count,
              SUM(CASE WHEN start_time >= ? THEN total_bandwidth ELSE 0 END) AS current_monthly_bandwidth
            FROM
                site_usage
            GROUP BY site_id
        "#,
        )
        .try_map(map_to_usage_totals)
        .fetch_all(&mut *self.get_db_conn().await?)
        .await?;

        Ok(entity)
    }
}
