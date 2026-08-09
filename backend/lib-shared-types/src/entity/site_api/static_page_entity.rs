// A statically generated page stored in the per-site database, keyed by
// route ('/', '/about', '/not-found', '/sitemap.xml', '/robots.txt', ...).
// `content_updated_at` records the published version's content_updated_at at
// generation time; the serve path compares it to the current published value
// and falls back to the SPA shell when stale.
#[derive(Debug, Clone)]
pub struct StaticPageEntity {
    pub route: String,
    pub body: String,
    pub content_type: String,
    pub content_updated_at: i64,
}
