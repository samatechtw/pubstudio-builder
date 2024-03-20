use std::sync::Arc;

use axum::async_trait;
use lib_shared_site_api::db::db_error::DbError;
use lib_shared_types::{
    dto::custom_data::{
        custom_data_info_dto::CustomDataInfoDto, list_tables_query::ListTablesQuery,
    },
    entity::site_api::site_custom_data_info_entity::CustomDataInfoEntity,
};
use sqlx::{sqlite::SqliteRow, Error, Row, SqlitePool};

use super::site_db_pool_manager::DbPoolManager;

pub type DynCustomDataInfoRepo = Arc<dyn CustomDataInfoRepoTrait + Send + Sync>;

#[async_trait]
pub trait CustomDataInfoRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn add_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError>;
    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<Vec<CustomDataInfoEntity>, DbError>;
}

pub struct CustomDataInfoRepo {
    pub db_pool_manager: DbPoolManager,
    pub manifest_dir: String,
}

fn map_to_custom_data_info_entity(row: SqliteRow) -> Result<CustomDataInfoEntity, Error> {
    Ok(CustomDataInfoEntity {
        id: row.try_get("id")?,
        name: row.try_get("name")?,
        columns: row.try_get("columns")?,
    })
}

#[async_trait]
impl CustomDataInfoRepoTrait for CustomDataInfoRepo {
    fn site_db_url(&self, id: &str) -> String {
        format!("sqlite:{}/db/sites/site_{}.db", &self.manifest_dir, id)
    }

    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError> {
        self.db_pool_manager
            .get_db_pool(id, &self.manifest_dir)
            .await
    }

    async fn add_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result: CustomDataInfoEntity = sqlx::query(
            r#"
          INSERT INTO custom_data_info(name, columns)
          VALUES (?1, ?2)
          RETURNING id, name, columns
        "#,
        )
        .bind(dto.name)
        .bind(dto.columns)
        .try_map(map_to_custom_data_info_entity)
        .fetch_one(&pool)
        .await?;

        Ok(result)
    }

    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<Vec<CustomDataInfoEntity>, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result = sqlx::query(
            r#"
            SELECT *
            FROM custom_data_info
            ORDER BY id ASC
            LIMIT ? OFFSET ?
        "#,
        )
        .bind(query.to - query.from + 1)
        .bind(query.from - 1)
        .try_map(map_to_custom_data_info_entity)
        .fetch_all(&pool)
        .await?;

        Ok(result)
    }
}
