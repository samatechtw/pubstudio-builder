use std::sync::Arc;

use axum::async_trait;
use lib_shared_site_api::db::{db_error::DbError, db_result::list_result};
use lib_shared_types::{
    dto::custom_data::{
        custom_data_info_dto::CustomDataInfoDto, list_tables_query::ListTablesQuery,
    },
    entity::site_api::site_custom_data_info_entity::{
        CustomDataInfoEntity, CustomDataInfoEntityResult,
    },
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
    async fn update_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError>;
    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<CustomDataInfoEntityResult, DbError>;
    async fn get_columns_from_table(
        &self,
        id: &str,
        table_name: &String,
    ) -> Result<String, DbError>;
}

pub struct CustomDataInfoRepo {
    pub db_pool_manager: DbPoolManager,
    pub manifest_dir: String,
}

fn row_to_list_result(row: SqliteRow) -> Result<(CustomDataInfoEntity, i64), Error> {
    let count = row.try_get("count")?;
    let entity = map_to_custom_data_info_entity(row)?;
    Ok((entity, count))
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

    async fn update_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result: CustomDataInfoEntity = sqlx::query(
            r#"
          UPDATE custom_data_info
          SET columns = ?1
          WHERE name = ?2
          RETURNING id, name, columns
        "#,
        )
        .bind(dto.columns)
        .bind(dto.name)
        .try_map(map_to_custom_data_info_entity)
        .fetch_one(&pool)
        .await?;

        Ok(result)
    }

    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<CustomDataInfoEntityResult, DbError> {
        let pool = self.get_db_pool(id).await?;

        let result = sqlx::query(
            r#"
            SELECT *, COUNT(*) OVER () AS count
            FROM custom_data_info
            ORDER BY id ASC
            LIMIT ? OFFSET ?
        "#,
        )
        .bind(query.to - query.from + 1)
        .bind(query.from - 1)
        .try_map(row_to_list_result)
        .fetch_all(&pool)
        .await?;

        let (results, total) = list_result(result);

        Ok(CustomDataInfoEntityResult { total, results })
    }

    async fn get_columns_from_table(
        &self,
        id: &str,
        table_name: &String,
    ) -> Result<String, DbError> {
        let pool = self.get_db_pool(id).await?;

        let columns = sqlx::query(
            r#"
            SELECT columns
            FROM custom_data_info
            WHERE name = ?1
        "#,
        )
        .bind(table_name)
        .try_map(|r: SqliteRow| r.try_get("columns"))
        .fetch_one(&pool)
        .await?;

        Ok(columns)
    }
}
