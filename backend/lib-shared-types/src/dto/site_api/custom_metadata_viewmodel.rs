use serde::Serialize;

#[derive(Serialize)]
pub struct CustomMetadata {
    pub id: String,
    pub name: String,
    pub columns: String,
}
