pub fn domain_from_parts(domain: &str, subdomain: &str) -> String {
    format!("{}.{}", subdomain, domain)
}

pub fn merge_domains(custom: Vec<String>, subdomain: String, domain_suffix: &str) -> Vec<String> {
    let mut domains = custom.clone();
    domains.push(domain_from_parts(domain_suffix, &subdomain));
    domains
}
