use std::fs;

use lazy_static::lazy_static;

lazy_static! {
    static ref SITE_HTML_V1: String = fs::read_to_string("index_v1.html").unwrap();
    static ref SITE_HTML: String = fs::read_to_string("index.html").unwrap();
}

/*
Uncomment for faster testing
*/

pub fn get_site_html_dev() -> String {
    return fs::read_to_string("index.html").unwrap();
}

pub fn get_site_html(version: &str) -> &'static str {
    if version == "1" || version == "0.1" {
        return &SITE_HTML_V1;
    }
    return &SITE_HTML;
}

lazy_static! {
    // Hydration runtime for statically generated pages. Optional so images
    // built before SSG support (or without the asset) keep working.
    static ref SITE_JS: Option<String> = fs::read_to_string("site.js").ok();
}

pub fn get_site_js_dev() -> Option<String> {
    fs::read_to_string("site.js").ok()
}

pub fn get_site_js() -> Option<&'static str> {
    SITE_JS.as_deref()
}
