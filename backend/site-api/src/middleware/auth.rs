use axum::{
    body::Body,
    extract::{Path, State},
    http::Request,
    middleware::Next,
    response::Response,
};
use axum_extra::headers::{authorization::Bearer, Authorization};
use lib_shared_site_api::{
    auth::{
        util::{extract_bearer, extract_bearer_optional},
        verify_jwt::verify_jwt,
    },
    error::api_error::ApiError,
};
use lib_shared_types::shared::user::{RequestUser, UserType};

use crate::{
    api_context::ApiContext,
    db::cache_helpers::{get_metadata_from_cache_or_repo, get_site_from_cache_or_repo},
};

// Verify that the requestor ID matches the Site Owner
// Note -- this assumes all Owner endpoints include a site_id
pub async fn verify_site_owner(
    context: &ApiContext,
    user: &RequestUser,
    site_id: &str,
) -> Result<(), ApiError> {
    if user.user_type == UserType::Owner {
        let user_id = user.user_id.ok_or(ApiError::unauthorized())?;

        let site_metadata = context
            .metadata_repo
            .get_site_metadata(site_id)
            .await
            .map_err(|_| ApiError::not_found())?;

        if site_metadata.owner_id != user_id.to_string() {
            return Err(ApiError::forbidden());
        }
    }
    Ok(())
}

pub async fn auth_admin(
    State(context): State<ApiContext>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    let (bearer, request) = extract_bearer(request).await?;

    auth_user(vec![UserType::Admin], bearer, context, request, next).await
}

pub async fn auth_admin_owner(
    State(context): State<ApiContext>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    let (bearer, request) = extract_bearer(request).await?;

    auth_user(
        vec![UserType::Admin, UserType::Owner],
        bearer,
        context,
        request,
        next,
    )
    .await
}

pub async fn auth_owner(
    State(context): State<ApiContext>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    let (bearer, request) = extract_bearer(request).await?;

    auth_user(vec![UserType::Owner], bearer, context, request, next).await
}

pub async fn auth_admin_owner_anonymous(
    State(context): State<ApiContext>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    let (bearer_opt, mut request) = extract_bearer_optional(request).await;
    if let Some(bearer) = bearer_opt {
        auth_user(
            vec![UserType::Admin, UserType::Owner],
            bearer,
            context,
            request,
            next,
        )
        .await
    } else {
        request.extensions_mut().insert(RequestUser {
            user_type: UserType::Anonymous,
            user_id: None,
        });
        Ok(next.run(request).await)
    }
}

pub async fn auth_user(
    expected_types: Vec<UserType>,
    auth: Authorization<Bearer>,
    context: ApiContext,
    mut request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    match verify_jwt(context.config.admin_public_key.to_string(), auth.token()) {
        Ok(user_token) => {
            if expected_types.contains(&user_token.user_type) {
                request.extensions_mut().insert(RequestUser {
                    user_type: user_token.user_type,
                    user_id: Some(user_token.user_id),
                });
                Ok(next.run(request).await)
            } else {
                Err(ApiError::forbidden())
            }
        }
        Err(e) => Err(e),
    }
}

pub async fn error_cache(
    State(context): State<ApiContext>,
    Path(site_id): Path<String>,
    request: Request<Body>,
    next: Next,
) -> Result<Response, ApiError> {
    let response = next.run(request).await;
    if response.status() != 200 {
        let site = get_site_from_cache_or_repo(&context, &site_id).await?;

        let metadata = get_metadata_from_cache_or_repo(&context, &site_id).await?;

        context
            .cache
            .increase_request_error_count(&site_id, &site, metadata.site_type)
            .await;
    }
    Ok(response)
}
