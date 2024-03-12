use std::sync::Arc;

use axum::async_trait;
use lib_shared_site_api::db::db_error::DbError;
use lib_shared_types::dto::site_api::custom_data_dto::CreateTable;
use sqlx::{Error, SqlitePool};

use super::site_db_pool_manager::DbPoolManager;

pub type DynCustomDataRepo = Arc<dyn CustomDataRepoTrait + Send + Sync>;

#[async_trait]
pub trait CustomDataRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn create_table(&self, dto: CreateTable) -> Result<(), Error>;
    async fn insert(&self) -> Result<(), Error>;
    async fn list_tables(&self) -> Result<(), Error>;
    async fn list_rows(&self) -> Result<(), Error>;
    async fn update_row(&self) -> Result<(), Error>;
    async fn add_column(&self) -> Result<(), Error>;
    async fn remove_column(&self) -> Result<(), Error>;
    async fn modify_column(&self) -> Result<(), Error>;
}

pub struct CustomDataRepo {
    pub db_pool_manager: DbPoolManager,
    pub manifest_dir: String,
}

#[async_trait]
impl CustomDataRepoTrait for CustomDataRepo {
    fn site_db_url(&self, id: &str) -> String {
        format!("sqlite:{}/db/sites/site_{}.db", &self.manifest_dir, id)
    }

    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError> {
        self.db_pool_manager
            .get_db_pool(id, &self.manifest_dir)
            .await
    }

    async fn create_table(&self, dto: CreateTable) -> Result<(), Error> {
        Ok(())
    }

    async fn insert(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn list_tables(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn list_rows(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn update_row(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn add_column(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn remove_column(&self) -> Result<(), Error> {
        Ok(())
    }

    async fn modify_column(&self) -> Result<(), Error> {
        Ok(())
    }
}
