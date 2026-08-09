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
    // Hydration runtime for statically generated pages. Shipped in the same image
    // layer as index.html, so a missing file is a broken build rather than a state
    // worth degrading for -- serving 404s here would leave generated pages
    // rendered but never hydrated, which is invisible until someone clicks.
    static ref SITE_JS: String = fs::read_to_string("site.js").unwrap();
}

pub fn get_site_js_dev() -> String {
    return fs::read_to_string("site.js").unwrap();
}

pub fn get_site_js() -> &'static str {
    return &SITE_JS;
}
