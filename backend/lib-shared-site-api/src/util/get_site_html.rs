use std::fs;

use lazy_static::lazy_static;

lazy_static! {
    static ref SITE_HTML: String = fs::read_to_string("index.html").unwrap();
}

pub fn get_site_html() -> &'static str {
    return &SITE_HTML;
}
