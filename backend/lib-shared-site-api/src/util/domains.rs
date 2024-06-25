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
