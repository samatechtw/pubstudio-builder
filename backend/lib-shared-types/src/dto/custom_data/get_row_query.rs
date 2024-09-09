use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate, Clone)]
#[serde(deny_unknown_fields)]
pub struct FieldEqFilter {
    pub field: String,
    pub value: String,
}

#[derive(Deserialize, Validate, Clone)]
#[serde(deny_unknown_fields)]
pub struct RowFilters {
    pub field_eq: Option<FieldEqFilter>,
}

#[derive(Deserialize, Validate, Clone)]
#[serde(deny_unknown_fields)]
pub struct GetRowQuery {
    pub table_name: String,
    pub filters: Option<RowFilters>,
}
