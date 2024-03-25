use std::borrow::Cow::Borrowed;
use std::{collections::BTreeMap, sync::Arc};

use axum::async_trait;
use lib_shared_site_api::db::{
    db_error::{map_sqlx_err, DbError},
    db_result::list_result,
};
use lib_shared_types::dto::custom_data::{
    add_row_dto::AddRow,
    create_table_dto::{CreateTable, RuleType},
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
    async fn insert(&self, id: &str, dto: AddRow) -> Result<(), DbError>;
    async fn list_rows(&self, id: &str, query: ListRowsQuery) -> Result<ListRowsResponse, DbError>;
    async fn update_row(
        &self,
        id: &str,
        dto: UpdateRow,
    ) -> Result<BTreeMap<String, String>, DbError>;
    async fn add_column(&self, id: &str) -> Result<(), DbError>;
    async fn remove_column(&self, id: &str) -> Result<(), DbError>;
    async fn modify_column(&self, id: &str) -> Result<(), DbError>;
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
            {
                return DbError::Query(err_str);
            }
        }
        sqlx::Error::RowNotFound => return DbError::EntityNotFound(),
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
        query.push(table_name);
        query.push(" (id INTEGER PRIMARY KEY NOT NULL");

        for (column_name, column_info) in dto.columns.iter() {
            let column_type = column_info.data_type.to_string();

            query.push(format!(", {}", column_name));
            query.push(" ");
            query.push(column_type);
            query.push(" NOT NULL");

            for rule in column_info.validation_rules.iter() {
                match rule.rule_type {
                    RuleType::Unique => {
                        query.push(" UNIQUE");
                    }
                    RuleType::MinLength => {
                        if let Some(min_length) = rule.parameter {
                            query.push(&format!(
                                " CHECK (length({}) >= {}) ",
                                column_name, min_length
                            ));
                        }
                    }
                    RuleType::MaxLength => {
                        if let Some(max_length) = rule.parameter {
                            query.push(&format!(
                                " CHECK (length({}) <= {}) ",
                                column_name, max_length
                            ));
                        }
                    }
                    _ => {}
                }
            }
        }

        query.push(")");

        println!("SQL Query: {}", query.sql());

        query.build().execute(&pool).await.map_err(map_sqlx_err)?;

        Ok(())
    }

    async fn insert(&self, id: &str, dto: AddRow) -> Result<(), DbError> {
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
            column_names.push_str(k);
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
            set_values.push_str(&format!("{} = '{}'", k, v));
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

    async fn add_column(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
    }

    async fn remove_column(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
    }

    async fn modify_column(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
    }
}
