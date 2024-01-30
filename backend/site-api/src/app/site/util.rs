use lib_shared_types::{
    entity::site_api::site_metadata_entity::SiteMetadataEntity,
    shared::user::{RequestUser, UserType},
};

pub fn is_admin_or_site_owner(metadata: &SiteMetadataEntity, user: &RequestUser) -> bool {
    match user.user_type {
        UserType::Admin => true,
        UserType::Anonymous => false,
        UserType::Cron => false,
        UserType::Owner => {
            if let Some(user_id) = user.user_id {
                user_id.to_string() == metadata.owner_id
            } else {
                false
            }
        }
    }
}
