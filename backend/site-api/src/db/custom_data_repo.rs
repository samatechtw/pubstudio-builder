use std::sync::Arc;

use axum::async_trait;
use lib_shared_site_api::db::db_error::{map_sqlx_err, DbError};
use lib_shared_types::dto::custom_data::create_table_dto::{CreateTable, RuleType};
use sqlx::{QueryBuilder, Sqlite, SqlitePool};

use super::site_db_pool_manager::DbPoolManager;

pub type DynCustomDataRepo = Arc<dyn CustomDataRepoTrait + Send + Sync>;

#[async_trait]
pub trait CustomDataRepoTrait {
    fn site_db_url(&self, id: &str) -> String;
    async fn get_db_pool(&self, id: &str) -> Result<SqlitePool, DbError>;
    async fn create_table(&self, id: &str, dto: CreateTable) -> Result<(), DbError>;
    async fn insert(&self, id: &str) -> Result<(), DbError>;
    async fn list_rows(&self, id: &str) -> Result<(), DbError>;
    async fn update_row(&self, id: &str) -> Result<(), DbError>;
    async fn add_column(&self, id: &str) -> Result<(), DbError>;
    async fn remove_column(&self, id: &str) -> Result<(), DbError>;
    async fn modify_column(&self, id: &str) -> Result<(), DbError>;
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

        println!("sql: {}", query.sql());

        query.build().execute(&pool).await.map_err(map_sqlx_err)?;

        Ok(())
    }

    async fn insert(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
    }

    async fn list_rows(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
    }

    async fn update_row(&self, id: &str) -> Result<(), DbError> {
        let pool = self.get_db_pool(id).await?;
        Ok(())
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
