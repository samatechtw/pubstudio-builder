use sqlx;
use thiserror::Error;
use tokio::task::JoinError;

pub fn map_sqlx_err(e: sqlx::Error) -> DbError {
    match e {
        sqlx::Error::RowNotFound => DbError::EntityNotFound(),
        _ => DbError::Query(e.to_string()),
    }
}

#[derive(Debug, Error)]
pub enum DbError {
    #[error("Failed to set up db: {0}")]
    Create(String),
    #[error("Failed to migrate db: {0}")]
    Migrate(String),
    #[error("Password error: {0}")]
    Password(String),
    #[error("error accessing file: {0}")]
    FileError(String),
    #[error("{0} already exists")]
    Unique(String),
    #[error("{0} does not exist")]
    Missing(String),
    #[error("Query error: {0}")]
    Query(String),
    #[error("Update requires at least one non-empty field")]
    NoUpdate,
    #[error(transparent)]
    JoinTokio(#[from] JoinError),
    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),
    #[error("{0}")]
    NoDb(String),
    #[error("Serialization failed: {0}")]
    Serialize(String),
    #[error("Parsing failed: {0}")]
    Parse(String),
    #[error("Entity not found")]
    EntityNotFound(),
    #[error("Column not found: {0}")]
    ColumnNotFound(String),
    #[error("Length check failed: {0}")]
    CheckLengthFailed(String),
}
