use std::{collections::HashMap, sync::Arc};

use lib_shared_site_api::db::db_error::DbError;
use sqlx::{pool::PoolConnection, Sqlite, SqlitePool, Transaction};
use tokio::sync::RwLock;

pub type SiteDbPools = Arc<RwLock<HashMap<String, SqlitePool>>>;

pub type SqlitePoolConnection = PoolConnection<Sqlite>;

#[derive(Clone)]
pub struct DbPoolManager {
    pub site_db_pools: SiteDbPools,
}

impl DbPoolManager {
    pub fn new(site_db_pools: SiteDbPools) -> Self {
        Self { site_db_pools }
    }

    pub async fn get_db_conn(
        &self,
        id: &str,
        manifest_dir: &str,
    ) -> Result<SqlitePoolConnection, DbError> {
        let pool = self.get_db_pool(id, manifest_dir).await?;
        Ok(pool.acquire().await?)
    }

    pub async fn start_transaction(
        &self,
        id: &str,
        manifest_dir: &str,
    ) -> Result<Transaction<'_, Sqlite>, DbError> {
        let tx = self.get_db_pool(id, manifest_dir).await?;
        Ok(tx.begin().await?)
    }

    pub async fn get_db_pool(&self, id: &str, manifest_dir: &str) -> Result<SqlitePool, DbError> {
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
            let site_db_url = format!("sqlite:{}/db/sites/site_{}.db", manifest_dir, id);

            if let Some(pool) = db_pools.get_mut(id) {
                *pool = SqlitePool::connect(&site_db_url)
                    .await
                    .map_err(|e| DbError::NoDb(e.to_string()))?;
                return Ok(pool.clone());
            } else {
                if let Ok(new_pool) = SqlitePool::connect(&site_db_url).await {
                    db_pools.insert(id.to_string(), new_pool.clone());
                    return Ok(new_pool);
                }
            }
        }
        Err(DbError::NoDb("Failed to get DB pool".into()))
    }

    pub async fn insert_db_pool(&self, id: &str, pool: SqlitePool) -> Result<(), DbError> {
        let mut db_pools = self.site_db_pools.write().await;
        db_pools.insert(id.to_string(), pool);
        Ok(())
    }

    pub async fn remove_db_pool(&self, id: &str) -> Result<(), DbError> {
        let mut db_pools = self.site_db_pools.write().await;

        match db_pools.get(id) {
            Some(&ref pool) => {
                pool.close().await;
                db_pools.remove(id);
            }
            _ => println!("DB pool not found"),
        }
        Ok(())
    }
}
