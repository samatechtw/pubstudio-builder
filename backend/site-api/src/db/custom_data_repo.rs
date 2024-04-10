use std::borrow::Cow::Borrowed;
use std::{collections::BTreeMap, sync::Arc};

use axum::async_trait;
use lib_shared_site_api::db::util::{append_column_info_to_query, append_or_eq, quote};
use lib_shared_site_api::db::{
    db_error::{map_sqlx_err, DbError},
    db_result::list_result,
};
use lib_shared_types::dto::custom_data::add_column_dto::AddColumn;
use lib_shared_types::dto::custom_data::custom_data_dto::Action;
use lib_shared_types::dto::custom_data::remove_column_dto::RemoveColumn;
use lib_shared_types::dto::custom_data::remove_row_dto::RemoveRow;
use lib_shared_types::dto::custom_data::{
    add_row_dto::AddRow,
    create_table_dto::CreateTable,
    list_rows_query::{ListRowsQuery, ListRowsResponse},
    update_row_dto::UpdateRow,
};
use sqlx::{sqlite::SqliteRow, Column, Error, QueryBuilder, Row, Sqlite, SqlitePool};

use super::site_db_pool_manager::DbPoolManager;

pub type DynCustomDataRepo = Arc<dyn CustomDataRepoTrait + Send + Sync>;

#[async_trait]
pub trait CustomDataRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn create_table(&self, id: &str, dto: CreateTable) -> Result<(), DbError>;
    async fn add_row(&self, id: &str, dto: AddRow) -> Result<(), DbError>;
    async fn remove_row(&self, id: &str, dto: RemoveRow) -> Result<(), DbError>;
    async fn verify_unique(
        &self,
        id: &str,
        table_name: &str,
        entries: Vec<(String, String)>,
    ) -> Result<bool, DbError>;
    async fn list_rows(&self, id: &str, query: ListRowsQuery) -> Result<ListRowsResponse, DbError>;
    async fn update_row(
        &self,
        id: &str,
        dto: UpdateRow,
    ) -> Result<BTreeMap<String, String>, DbError>;
    async fn add_column(&self, id: &str, dto: AddColumn) -> Result<(), DbError>;
    async fn remove_column(&self, id: &str, dto: &RemoveColumn) -> Result<(), DbError>;
    async fn modify_column(
        &self,
        id: &str,
        table: &str,
        old_column: &str,
        new_column: &str,
    ) -> Result<(), DbError>;
}

pub struct CustomDataRepo {
    pub db_pool_manager: DbPoolManager,
    pub manifest_dir: String,
}

fn row_to_list_result(row: SqliteRow) -> Result<(BTreeMap<String, String>, i64), Error> {
    let count = row.try_get("count")?;
    let entity = map_to_key_value(row)?;
    Ok((entity, count))
}

fn map_to_key_value(row: SqliteRow) -> Result<BTreeMap<String, String>, Error> {
    let mut row_data = BTreeMap::new();

    for column in row.columns().iter() {
        let column_name = column.name();
        match column_name {
            "count" => continue, // Skip processing for "count" column
            "id" => {
                let value: String = row.try_get::<i64, _>(column_name)?.to_string();
                row_data.insert(column_name.to_string(), value);
            }
            _ => {
                let value: String = row.try_get(column_name)?; // Assuming all values are strings
                row_data.insert(column_name.to_string(), value);
            }
        }
    }

    Ok(row_data)
}

fn map_custom_data_sqlx_err(e: sqlx::Error) -> DbError {
    let err_str = e.to_string();
    match e {
        sqlx::Error::Database(err) => {
            let constraint_info = err.message().split(": ").collect::<Vec<&str>>();

            if err.code() == Some(Borrowed("2067")) {
                let failed_constraint = constraint_info
                    .get(1)
                    .map(|s| s.split('.').last())
                    .flatten()
                    .map(|s| s.trim())
                    .unwrap_or("Unknown");

                return DbError::Unique(failed_constraint.into());
            } else if err.code() == Some(Borrowed("275")) {
                let failed_constraint = constraint_info
                    .get(1)
                    .map(|s| s.split('(').nth(1))
                    .flatten()
                    .map(|s| s.split(')').next())
                    .flatten()
                    .map(|s| s.trim())
                    .unwrap_or("Unknown");
                return DbError::CheckLengthFailed(failed_constraint.into());
            }
            DbError::Query(err_str)
        }
        sqlx::Error::RowNotFound => return DbError::EntityNotFound(),
        sqlx::Error::ColumnNotFound(name) => return DbError::ColumnNotFound(name),
        _ => return DbError::Query(err_str),
    }
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

    async fn create_table(&self, id: &str, dto: CreateTable) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name;

        let mut query: QueryBuilder<'_, Sqlite> = QueryBuilder::new("CREATE TABLE ");
        query.push(quote(&table_name));
        query.push(" (id INTEGER PRIMARY KEY NOT NULL");

        let mut query = append_column_info_to_query(query, Action::CreateTable, &dto.columns);

        query.push(")");

        println!("SQL Query: {}", query.sql());

        query.build().execute(&pool).await.map_err(map_sqlx_err)?;

        Ok(())
    }

    async fn add_row(&self, id: &str, dto: AddRow) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name;

        let mut query = QueryBuilder::new("INSERT INTO ");
        query.push(table_name);

        let mut column_names = String::new();
        let mut column_values = String::new();

        for (k, v) in dto.row.iter() {
            if !column_names.is_empty() {
                column_names.push_str(", ");
                column_values.push_str(", ");
            }
            column_names.push_str(&quote(k));
            column_values.push_str(&format!("'{}'", v));
        }

        query.push(format!(" ({})", column_names));
        query.push(format!(" VALUES ({})", column_values));

        println!("SQL Query: {}", query.sql());

        query
            .build()
            .execute(&pool)
            .await
            .map_err(map_custom_data_sqlx_err)?;

        Ok(())
    }

    async fn remove_row(&self, id: &str, dto: RemoveRow) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name;

        sqlx::query(&format!("DELETE FROM {} WHERE id = ?1", table_name))
            .bind(dto.row_id)
            .execute(&pool)
            .await?;

        Ok(())
    }

    async fn verify_unique(
        &self,
        id: &str,
        table_name: &str,
        entries: Vec<(String, String)>,
    ) -> Result<bool, DbError> {
        let pool = self.get_db_pool(id).await?;
        let mut count = 0;

        let mut query = QueryBuilder::new("SELECT id FROM ");
        query.push(table_name);
        query.push(" WHERE ");

        for (name, val) in entries.iter() {
            let result = append_or_eq(query, name, Some(val), count);
            query = result.0;
            count = result.1;
        }

        let result = query.build().fetch_optional(&pool).await?;

        return Ok(result.is_none());
    }

    async fn list_rows(&self, id: &str, query: ListRowsQuery) -> Result<ListRowsResponse, DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = query.table_name;

        let mut q = QueryBuilder::new("SELECT *, COUNT(*) OVER () AS count FROM ");

        q.push(table_name);
        q.push(" LIMIT ");
        q.push_bind(query.to - query.from + 1);
        q.push(" OFFSET ");
        q.push_bind(query.from - 1);

        println!("SQL Query: {}", q.sql());

        let results = q
            .build()
            .try_map(row_to_list_result)
            .fetch_all(&pool)
            .await?;

        let (results, total) = list_result(results);

        Ok(ListRowsResponse { total, results })
    }

    async fn update_row(
        &self,
        id: &str,
        dto: UpdateRow,
    ) -> Result<BTreeMap<String, String>, DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name;

        let mut query = QueryBuilder::new("UPDATE ");
        query.push(table_name);
        query.push(" SET ");

        let mut set_values = String::new();
        for (k, v) in dto.new_row.iter() {
            if !set_values.is_empty() {
                set_values.push_str(", ");
            }
            set_values.push_str(&format!("{} = '{}'", quote(k), v));
        }

        query.push(set_values);
        query.push(" WHERE id = ");
        query.push_bind(dto.row_id);
        query.push(" RETURNING *");

        println!("SQL Query: {}", query.sql());

        Ok(query
            .build()
            .try_map(map_to_key_value)
            .fetch_one(&pool)
            .await
            .map_err(map_custom_data_sqlx_err)?)
    }

    async fn add_column(&self, id: &str, dto: AddColumn) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name;

        let mut query: QueryBuilder<'_, Sqlite> = QueryBuilder::new("ALTER TABLE ");
        query.push(table_name);
        query.push(" ADD COLUMN ");

        let mut query = append_column_info_to_query(query, Action::AddColumn, &dto.column);

        println!("SQL Query: {}", query.sql());

        query
            .build()
            .execute(&pool)
            .await
            .map_err(map_custom_data_sqlx_err)?;

        Ok(())
    }

    async fn remove_column(&self, id: &str, dto: &RemoveColumn) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        let table_name = dto.table_name.clone();
        let column = dto.column_name.clone();

        sqlx::query(&format!(
            "ALTER TABLE {} DROP COLUMN {}",
            table_name,
            quote(&column)
        ))
        .execute(&pool)
        .await?;

        Ok(())
    }

    async fn modify_column(
        &self,
        id: &str,
        table: &str,
        old_column: &str,
        new_column: &str,
    ) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;

        sqlx::query(&format!(
            "ALTER TABLE {} RENAME COLUMN {} TO {}",
            table,
            quote(old_column),
            quote(new_column)
        ))
        .execute(&pool)
        .await?;

        Ok(())
    }
}
