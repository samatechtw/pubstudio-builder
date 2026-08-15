use axum::http::{header::ORIGIN, HeaderMap};
use lib_shared_types::type_util::{is_port, REGEX_PORT};

pub fn domain_from_parts(domain: &str, subdomain: &str) -> String {
    format!("{}.{}", subdomain, domain)
}

pub fn merge_domains(custom: Vec<String>, subdomain: &str, domain_suffix: &str) -> Vec<String> {
    let mut domains = custom.clone();
    domains.push(domain_from_parts(domain_suffix, subdomain));
    domains
}

// Get the domain from host with port stripped
pub fn domain_without_port(hostname: String) -> String {
    if is_port(&hostname) {
        let domain = REGEX_PORT.replace(&hostname, "");
        domain.to_string()
    } else {
        hostname
    }
}

// Domain of the request's Origin header, e.g. `https://example.com:8080` -> `example.com`.
// None for same-origin requests and "null" origins, which have no host.
pub fn origin_domain(headers: &HeaderMap) -> Option<String> {
    let origin = headers.get(ORIGIN)?.to_str().ok()?;
    let host = origin.split("://").nth(1)?;
    Some(domain_without_port(
        host.trim_end_matches('/').to_ascii_lowercase(),
    ))
}
