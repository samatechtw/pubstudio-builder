use sqlx::{Database, QueryBuilder};
use uuid::Uuid;

/// Appends " AND" if count is greater than 0
pub fn append_and<'a, DB: Database>(
    mut query: QueryBuilder<'a, DB>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if count != 0 {
        query.push(format!(" AND"));
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
    arg_name: &str,
    arg: Option<T>,
    count: u32,
) -> (QueryBuilder<'a, DB>, u32) {
    if let Some(arg_val) = arg {
        let (mut q, count) = append_and(query, count);
        q.push(format!(" \"{}\" = ", arg_name));
        q.push_bind(arg_val);
        return (q, count + 1);
    }
    (query, count)
}

pub fn append_comma<
    'a,
    T: 'a + sqlx::Type<DB> + sqlx::Encode<'a, DB> + Send,
    DB: sqlx::Database,
>(
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
        let (mut q, count) = append_and(query, count);
        q.push(" ");
        q.push_bind(arg_val);
        q.push(format!(" <@ {}", arg_name));
        return (q, count + 1);
    }
    (query, count)
}

pub fn option_string_to_uuid(str: Option<String>) -> Option<Uuid> {
    str.and_then(|id| Uuid::parse_str(&id).ok())
}

pub fn option_enum_to_string<T: ToString>(value: Option<T>) -> Option<String> {
    value.and_then(|v| Some(v.to_string()))
}
