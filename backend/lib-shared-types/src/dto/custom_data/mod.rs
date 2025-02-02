use std::collections::BTreeMap;

pub mod add_column_dto;
pub mod add_row_dto;
pub mod create_table_dto;
pub mod custom_data_dto;
pub mod custom_data_info_dto;
pub mod custom_data_info_viewmodel;
pub mod custom_event_dto;
pub mod delete_table_dto;
pub mod get_row_query;
pub mod list_rows_query;
pub mod list_tables_query;
pub mod modify_column_dto;
pub mod remove_column_dto;
pub mod remove_row_dto;
pub mod update_row_dto;
pub mod update_table_dto;

pub type CustomDataRow = BTreeMap<String, String>;
