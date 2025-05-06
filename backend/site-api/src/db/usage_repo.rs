use std::{collections::HashMap, sync::Arc};

use async_trait::async_trait;
use chrono::Utc;
use lib_shared_site_api::{cache::cache::SiteUsageCache, db::separated::Separated};
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
    let page_views_str: String = row.try_get("page_views")?;
    let page_views =
        serde_json::from_str(&page_views_str).map_err(|e| Error::Decode(Box::new(e)))?;

    Ok(SiteUsageEntity {
        id: row.try_get("id")?,
        site_id: row.try_get("site_id")?,
        request_count: row.try_get("request_count")?,
        site_view_count: row.try_get("site_view_count")?,
        request_error_count: row.try_get("request_error_count")?,
        total_bandwidth: row.try_get("total_bandwidth")?,
        page_views,
        start_time: row.try_get("start_time")?,
        end_time: row.try_get("end_time")?,
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
        QueryBuilder::new("INSERT INTO site_usage(site_id, request_count, site_view_count, request_error_count, total_bandwidth, page_views, start_time, end_time) ");

        query_builder.push("VALUES ");
        let mut separated = Separated {
            query_builder: &mut query_builder,
            separator: ", ",
            push_separator: false,
        };

        for (site_id, site_data) in cache.iter() {
            separated.push("(");

            // use a `Separated` with another internal state
            let mut b = separated.query_builder.separated(", ");

            let page_views = serde_json::to_string(&site_data.page_views)
                .or(Err(Error::Encode("serialize page_views failed".into())))?;
            b.push_bind(site_id.to_string())
                .push_bind(site_data.request_count.to_string())
                .push_bind(site_data.site_view_count.to_string())
                .push_bind(site_data.request_error_count.to_string())
                .push_bind(site_data.total_bandwidth.to_string())
                .push_bind(page_views)
                .push_bind(site_data.last_updated.timestamp)
                .push_bind(Utc::now());

            separated.push_unseparated(")");
        }

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
        // Get numeric totals
        let totals: Vec<(u32, String, i64, i64, u64)> = sqlx::query_as(
            r#"
        SELECT
          id,
          site_id,
          SUM(request_count),
          SUM(site_view_count),
          SUM(CASE WHEN start_time >= ? THEN total_bandwidth ELSE 0 END)
        FROM site_usage
        GROUP BY site_id
        "#,
        )
        .bind(0)
        .fetch_all(&mut *self.get_db_conn().await?)
        .await?;

        // Get page_views JSON
        let raw_pages: Vec<(String, String)> =
            sqlx::query_as("SELECT site_id, page_views FROM site_usage")
                .fetch_all(&mut *self.get_db_conn().await?)
                .await?;

        // Group & sum page_views by site_id
        let mut page_acc: HashMap<String, HashMap<String, u64>> = HashMap::new();
        for (site_id, json_blob) in raw_pages {
            let map: HashMap<String, u64> =
                serde_json::from_str(&json_blob).map_err(|e| Error::Decode(Box::new(e)))?;
            let entry = page_acc.entry(site_id).or_default();
            for (route, cnt) in map {
                *entry.entry(route).or_default() += cnt;
            }
        }

        // Collect results
        let result = totals
            .into_iter()
            .map(|(id, site_id, req_tot, view_tot, bw)| SiteUsageTotals {
                id,
                site_id: site_id.clone(),
                total_request_count: req_tot,
                total_site_view_count: view_tot,
                current_monthly_bandwidth: bw,
                total_page_views: page_acc.remove(&site_id).unwrap_or(HashMap::new()),
            })
            .collect();

        Ok(result)
    }
}
