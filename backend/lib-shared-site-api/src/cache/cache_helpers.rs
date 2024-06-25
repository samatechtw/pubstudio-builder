use lib_shared_types::{
    domain::site_defaults::SiteHeadDefaults,
    dto::site_api::get_current_site_dto::GetCurrentSiteResponse,
};

pub fn get_site_defaults(site: &GetCurrentSiteResponse) -> Option<SiteHeadDefaults> {
    let unwrapped_defaults_res: Result<String, _> = serde_json::from_str(&site.defaults);
    let unwrapped_defaults = if let Ok(unwrapped) = unwrapped_defaults_res {
        unwrapped
    } else {
        return None;
    };

    let site_defaults: Option<SiteHeadDefaults> = match serde_json::from_str(&unwrapped_defaults) {
        Err(e) => {
            println!("Failed to get site defaults: {:?}", e);
            return None;
        }
        Ok(def) => def,
    };
    site_defaults
}

pub fn get_site_title(defaults: &Option<SiteHeadDefaults>, fallback: &str) -> String {
    if let Some(site_defaults) = defaults {
        let title = site_defaults.head.title.as_deref();
        return title.unwrap_or(fallback).to_string();
    }
    fallback.to_string()
}

pub fn get_site_description(defaults: &Option<SiteHeadDefaults>, fallback: &str) -> String {
    if let Some(site_defaults) = defaults {
        let description = site_defaults.head.description.as_deref();
        return description.unwrap_or(fallback).to_string();
    }
    fallback.to_string()
}
