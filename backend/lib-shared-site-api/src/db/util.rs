use std::collections::HashMap;

use lib_shared_types::dto::custom_data::{create_table_dto::ColumnInfo, custom_data_dto::Action};
use sqlx::{Database, QueryBuilder};
use strum::{Display, EnumString};
use uuid::Uuid;

#[derive(Debug, Display, PartialEq, EnumString)]
#[strum(serialize_all = "UPPERCASE")]
pub enum DbOp {
    And,
    Or,
}

pub fn quote(sql: &str) -> String {
    format!("\"{sql}\"")
}

/// Appends " <op>" if count is greater than 0
pub fn append_op<'a, DB: Database>(
    mut query: QueryBuilder<'a, DB>,
    op: DbOp,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if count != 0 {
        query.push(format!(" {}", op));
    }
    (query, count + 1)
}

/// Appends a " field = $x" binding to the query builder,
/// prepended with " AND" if it's not the first call
/// Returns the input `count + 1` if a parameter was bound
pub fn append_eq<
    'a,
    DB: Database,
    T: 'a + ToString + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
>(
    query: QueryBuilder<'a, DB>,
    op: DbOp,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if let Some(arg_val) = arg {
        let (mut q, count) = append_op(query, op, count);
        q.push(format!(" \"{}\" = ", arg_name));
        q.push_bind(arg_val);
        return (q, count + 1);
    }
    (query, count)
}

pub fn append_and_eq<
    'a,
    DB: Database,
    T: 'a + ToString + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
>(
    query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    append_eq(query, DbOp::And, arg_name, arg, count)
}

pub fn append_or_eq<
    'a,
    DB: Database,
    T: 'a + ToString + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
>(
    query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    append_eq(query, DbOp::Or, arg_name, arg, count)
}

fn push_comma<'a, DB: sqlx::Database>(
    mut query: QueryBuilder<'a, DB>,
    arg_name: &str,
    count: u32,
) -> QueryBuilder<'a, DB> {
    if count == 0 {
        query.push(format!(" {} = ", arg_name));
    } else {
        query.push(format!(", {} = ", arg_name));
    }
    query
}

// Appends a comma separated value to the query.
// Option/None is accepted, which converts to NULL
pub fn append_nullable_comma<
    'a,
    T: 'a + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
    DB: sqlx::Database,
>(
    mut query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: T,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    query = push_comma(query, arg_name, count);
    query.push_bind(arg);
    (query, count + 1)
}

// Appends a non-null comma separated value to the query.
pub fn append_comma<
    'a,
    T: 'a + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
    DB: sqlx::Database,
>(
    query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if let Some(arg_val) = arg {
        return append_nullable_comma(query, arg_name, arg_val, count);
    }
    (query, count)
}

pub fn append_comma_str<'a, DB: Database, T: 'a + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send>(
    mut query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if let Some(arg_val) = arg {
        if count == 0 {
            query.push(format!(" {} = ", arg_name));
        } else {
            query.push(format!(", {} = ", arg_name));
        }
        query.push_bind(arg_val);
        return (query, count + 1);
    }
    (query, count)
}

pub fn append_order_by<'a, DB: Database>(
    mut query: QueryBuilder<'a, DB>,
    column: String,
    direction: String,
) -> QueryBuilder<'a, DB> {
    query.push(format!(" ORDER BY {}", column));
    query.push(format!(" {}", direction));
    query
}

pub fn append_array_contains<'a, DB, T>(
    query: QueryBuilder<'a, DB>,
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32)
where
    DB: Database,
    T: 'a + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
{
    if let Some(arg_val) = arg {
        let (mut q, count) = append_op(query, DbOp::And, count);
        q.push(" ");
        q.push_bind(arg_val);
        q.push(format!(" <@ {}", arg_name));
        return (q, count + 1);
    }
    (query, count)
}

pub fn append_column_info_to_query<'a, DB: Database>(
    mut query: QueryBuilder<'a, DB>,
    action_type: Action,
    columns: &HashMap<String, ColumnInfo>,
) -> QueryBuilder<'a, DB> {
    for (column_name, column_info) in columns.iter() {
        let column_type = column_info.data_type.to_string();
        let quoted_column = quote(&column_name);

        match action_type {
            Action::CreateTable => {
                query.push(format!(", {}", quoted_column));
            }
            Action::AddColumn => {
                query.push(quoted_column);
            }
            _ => {}
        }

        query.push(" ");
        query.push(column_type);
        query.push(" NOT NULL");

        match action_type {
            Action::AddColumn => {
                query.push(" DEFAULT ''");
            }
            _ => {}
        }
    }
    query
}

pub fn option_string_to_uuid(str: Option<String>) -> Option<Uuid> {
    str.and_then(|id| Uuid::parse_str(&id).ok())
}

pub fn option_enum_to_string<T: ToString>(value: Option<T>) -> Option<String> {
    value.and_then(|v| Some(v.to_string()))
}
