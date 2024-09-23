use std::sync::Arc;

use axum::async_trait;
use lib_shared_site_api::db::{
    db_error::{map_sqlx_err, DbError},
    db_result::list_result,
};
use lib_shared_types::{
    dto::custom_data::{
        custom_data_info_dto::{CustomDataInfoDto, CustomDataUpdateColumns},
        list_tables_query::ListTablesQuery,
    },
    entity::site_api::site_custom_data_info_entity::{
        CustomDataInfoEntity, CustomDataInfoEntityList,
    },
};
use sqlx::{sqlite::SqliteRow, Error, Row};

use super::site_db_pool_manager::{DbPoolManager, SqlitePoolConnection};

pub type DynCustomDataInfoRepo = Arc<dyn CustomDataInfoRepoTrait + Send + Sync>;

#[async_trait]
pub trait CustomDataInfoRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn get_db_conn(&self, id: &str) -> Result<SqlitePoolConnection, DbError>;
    async fn add_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError>;
    async fn update_columns(
        &self,
        id: &str,
        dto: CustomDataUpdateColumns,
    ) -> Result<CustomDataInfoEntity, DbError>;
    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<CustomDataInfoEntityList, DbError>;
    async fn get_table(&self, id: &str, table_name: &str) -> Result<CustomDataInfoEntity, DbError>;
    async fn get_custom_tables_size(&self, id: &str) -> Result<i64, DbError>;
    async fn remove_info(&self, id: &str, table_name: &str) -> Result<(), DbError>;
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
        events: row.try_get("events")?,
    })
}

#[async_trait]
impl CustomDataInfoRepoTrait for CustomDataInfoRepo {
    fn site_db_url(&self, id: &str) -> String {
        format!("sqlite:{}/db/sites/site_{}.db", &self.manifest_dir, id)
    }

    async fn get_db_conn(&self, id: &str) -> Result<SqlitePoolConnection, DbError> {
        self.db_pool_manager
            .get_db_conn(id, &self.manifest_dir)
            .await
    }

    async fn add_info(
        &self,
        id: &str,
        dto: CustomDataInfoDto,
    ) -> Result<CustomDataInfoEntity, DbError> {
        let mut conn = self.get_db_conn(id).await?;

        let result: CustomDataInfoEntity = sqlx::query(
            r#"
          INSERT INTO custom_data_info(name, columns, events)
          VALUES (?1, ?2, ?3)
          RETURNING id, name, columns, events
        "#,
        )
        .bind(dto.name)
        .bind(dto.columns)
        .bind(dto.events)
        .try_map(map_to_custom_data_info_entity)
        .fetch_one(&mut *conn)
        .await?;

        Ok(result)
    }

    async fn update_columns(
        &self,
        id: &str,
        dto: CustomDataUpdateColumns,
    ) -> Result<CustomDataInfoEntity, DbError> {
        let mut conn = self.get_db_conn(id).await?;

        let result: CustomDataInfoEntity = sqlx::query(
            r#"
          UPDATE custom_data_info
          SET columns = ?1
          WHERE name = ?2
          RETURNING id, name, columns, events
        "#,
        )
        .bind(dto.columns)
        .bind(dto.name)
        .try_map(map_to_custom_data_info_entity)
        .fetch_one(&mut *conn)
        .await
        .map_err(map_sqlx_err)?;

        Ok(result)
    }

    async fn list_tables(
        &self,
        id: &str,
        query: ListTablesQuery,
    ) -> Result<CustomDataInfoEntityList, DbError> {
        let mut conn = self.get_db_conn(id).await?;

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
        .fetch_all(&mut *conn)
        .await?;

        let (results, total) = list_result(result);

        Ok(CustomDataInfoEntityList { total, results })
    }

    async fn get_table(&self, id: &str, table_name: &str) -> Result<CustomDataInfoEntity, DbError> {
        let mut conn = self.get_db_conn(id).await?;

        let columns = sqlx::query(
            r#"
            SELECT *
            FROM custom_data_info
            WHERE name = ?1
        "#,
        )
        .bind(table_name)
        .try_map(map_to_custom_data_info_entity)
        .fetch_one(&mut *conn)
        .await
        .map_err(map_sqlx_err)?;

        Ok(columns)
    }

    async fn get_custom_tables_size(&self, id: &str) -> Result<i64, DbError> {
        let mut conn = self.get_db_conn(id).await?;

        let row = sqlx::query(
            r#"
            SELECT
                SUM(total_bytes) AS size
            FROM (
                SELECT
                    name,
                    (page_count * page_size) AS total_bytes
                FROM
                    pragma_page_size
                JOIN
                    pragma_page_count ON 1 = 1
                JOIN
                    sqlite_master ON type = 'table'
                WHERE
                    name NOT LIKE 'sqlite_%'
                AND
                    name != 'site_versions'
                AND
                    name != 'custom_data_info'
                AND
                    name != '_sqlx_migrations'
            );
            "#,
        )
        .fetch_one(&mut *conn)
        .await?;

        Ok(row.try_get("size")?)
    }

    async fn remove_info(&self, id: &str, table_name: &str) -> Result<(), DbError> {
        let mut conn = self.get_db_conn(id).await?;

        sqlx::query("DELETE FROM custom_data_info WHERE name = ?1")
            .bind(table_name)
            .execute(&mut *conn)
            .await?;

        Ok(())
    }
}
