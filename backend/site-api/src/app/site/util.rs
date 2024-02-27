use lib_shared_types::shared::user::{RequestUser, UserType};

pub fn is_admin_or_site_owner(owner_id: &String, user: &RequestUser) -> bool {
    match user.user_type {
        UserType::Admin => true,
        UserType::Anonymous => false,
        UserType::Cron => false,
        UserType::Owner => {
            if let Some(user_id) = user.user_id {
                user_id.to_string() == owner_id.to_string()
            } else {
                false
            }
        }
    }
}
