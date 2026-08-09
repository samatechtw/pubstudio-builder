// An SSG page stored in the site database, keyed by route.
#[derive(Debug, Clone)]
pub struct StaticPageEntity {
    pub route: String,
    pub body: String,
    pub content_type: String,
    pub content_updated_at: i64,
}
