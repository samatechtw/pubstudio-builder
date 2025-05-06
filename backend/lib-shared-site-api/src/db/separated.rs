use std::fmt::Display;

use sqlx::{Database, Encode, QueryBuilder, Type};

/// Copied from SQLx src/query_builder.rs
/// The only change is to make fields public, and adding an initializer

/// A wrapper around `QueryBuilder` for creating comma(or other token)-separated lists.
///
/// See [`QueryBuilder::separated()`] for details.
#[allow(explicit_outlives_requirements)]
pub struct Separated<'qb, 'args: 'qb, DB, Sep>
where
    DB: Database,
{
    pub query_builder: &'qb mut QueryBuilder<'args, DB>,
    pub separator: Sep,
    pub push_separator: bool,
}

impl<'qb, 'args: 'qb, DB, Sep> Separated<'qb, 'args, DB, Sep>
where
    DB: Database,
    Sep: Display,
{
    /// Push the separator if applicable, and then the given SQL fragment.
    ///
    /// See [`QueryBuilder::push()`] for details.
    pub fn push(&mut self, sql: impl Display) -> &mut Self {
        if self.push_separator {
            self.query_builder
                .push(format_args!("{}{}", self.separator, sql));
        } else {
            self.query_builder.push(sql);
            self.push_separator = true;
        }

        self
    }

    /// Push a SQL fragment without a separator.
    ///
    /// Simply calls [`QueryBuilder::push()`] directly.
    pub fn push_unseparated(&mut self, sql: impl Display) -> &mut Self {
        self.query_builder.push(sql);
        self
    }

    /// Push the separator if applicable, then append a bind argument.
    ///
    /// See [`QueryBuilder::push_bind()`] for details.
    pub fn push_bind<T>(&mut self, value: T) -> &mut Self
    where
        T: 'args + Encode<'args, DB> + Type<DB>,
    {
        if self.push_separator {
            self.query_builder.push(&self.separator);
        }

        self.query_builder.push_bind(value);
        self.push_separator = true;

        self
    }

    /// Push a bind argument placeholder (`?` or `$N` for Postgres) and bind a value to it
    /// without a separator.
    ///
    /// Simply calls [`QueryBuilder::push_bind()`] directly.
    pub fn push_bind_unseparated<T>(&mut self, value: T) -> &mut Self
    where
        T: 'args + Encode<'args, DB> + Type<DB>,
    {
        self.query_builder.push_bind(value);
        self
    }
}
