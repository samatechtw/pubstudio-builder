use crate::reqwest::Url;
use crate::{error::api_error::ApiError, reqwest};
use rusty_s3::{Bucket, Credentials, S3Action, UrlStyle};
use std::time::Duration;

#[derive(Clone)]
pub struct S3Client {
    credentials: Credentials,
    pub site_asset_bucket: Bucket,
    pub template_preview_bucket: Bucket,
    pub backup_bucket: Bucket,
}

impl S3Client {
    pub fn new(s3_url: String, s3_access_key_id: String, s3_secret_access_key: String) -> S3Client {
        let endpoint: Url = s3_url.parse().expect("s3 endpoint is invalid");
        let path_style = UrlStyle::Path;
        let site_asset_name = "site-assets";
        let region = "auto";
        let site_asset_bucket = Bucket::new(endpoint.clone(), path_style, site_asset_name, region)
            .expect("site-asset bucket url is invalid");

        let template_preview_name = "template-previews";
        let template_preview_bucket =
            Bucket::new(endpoint.clone(), path_style, template_preview_name, region)
                .expect("template-preview bucket url is invalid");

        let backup_name = "site-backups";
        let backup_bucket =
            Bucket::new(endpoint, path_style, backup_name, region).expect("Bucket url is invalid");

        let credentials = Credentials::new(s3_access_key_id, s3_secret_access_key);

        S3Client {
            credentials,
            site_asset_bucket,
            template_preview_bucket,
            backup_bucket,
        }
    }

    fn presign_put(
        &self,
        bucket: &Bucket,
        filename: &str,
        expires: u64,
        content_type: &str,
        size: String,
    ) -> Result<Url, ApiError> {
        // Sign a request
        let presigned_url_duration = Duration::from_secs(expires);
        let mut action = bucket.put_object(Some(&self.credentials), filename);

        let query = action.query_mut();
        query.insert("Content-Type", content_type);
        query.insert("Content-Length", size);

        Ok(action.sign(presigned_url_duration))
    }

    async fn delete_asset(&self, bucket: &Bucket, object_key: &str) -> Result<(), ApiError> {
        let delete_object = bucket.delete_object(Some(&self.credentials), &object_key);

        let expires_in = Duration::from_secs(600);
        let url = delete_object.sign(expires_in);

        match reqwest::Client::new().delete(url).send().await {
            Ok(res) => {
                if res.status().is_success() {
                    Ok(())
                } else {
                    let error_message = match res.text().await {
                        Ok(text) => {
                            format!("Delete asset fail: {}, Response: {}", object_key, text)
                        }
                        Err(_) => format!("Delete asset fail: {}", object_key),
                    };

                    Err(ApiError::internal_error().message(error_message))
                }
            }
            Err(err) => Err(ApiError::internal_error().message(format!(
                "Failed to send DELETE request: {}, {}",
                object_key, err
            ))),
        }
    }

    pub fn presign_put_site_asset(
        &self,
        filename: &str,
        expires: u64,
        content_type: &str,
        size: i64,
    ) -> Result<Url, ApiError> {
        self.presign_put(
            &self.site_asset_bucket,
            filename,
            expires,
            content_type,
            size.to_string(),
        )
    }

    pub fn presign_put_template_preview(
        &self,
        filename: &str,
        expires: u64,
        content_type: &str,
        size: i64,
    ) -> Result<Url, ApiError> {
        self.presign_put(
            &self.template_preview_bucket,
            filename,
            expires,
            content_type,
            size.to_string(),
        )
    }

    pub async fn verify_site_asset(&self, object_key: &str) -> Result<bool, ApiError> {
        let head_object = self
            .site_asset_bucket
            .head_object(Some(&self.credentials), &object_key);

        let expires_in = Duration::from_secs(600);
        let url = head_object.sign(expires_in);

        match reqwest::Client::new().head(url).send().await {
            Ok(res) => Ok(res.status().is_success()),
            Err(err) => Err(ApiError::internal_error()
                .message("Failed to send HEAD request".to_string() + &err.to_string())),
        }
    }

    pub async fn delete_site_asset(&self, object_key: &str) -> Result<(), ApiError> {
        self.delete_asset(&self.site_asset_bucket, object_key).await
    }

    pub async fn delete_template_preview(&self, object_key: &str) -> Result<(), ApiError> {
        self.delete_asset(&self.template_preview_bucket, object_key)
            .await
    }

    pub async fn upload_backup(&self, object_key: &str, body: Vec<u8>) -> Result<(), ApiError> {
        let upload_object = self
            .backup_bucket
            .put_object(Some(&self.credentials), &object_key);
        let expires_in = Duration::from_secs(600);
        let url = upload_object.sign(expires_in);

        match reqwest::Client::new().put(url).body(body).send().await {
            Ok(res) => {
                if res.status().is_success() {
                    Ok(())
                } else {
                    let error_message = match res.text().await {
                        Ok(text) => format!(
                            "Failed to upload backup: {}, Response: {}",
                            object_key, text
                        ),
                        Err(_) => format!("Failed to upload backup: {}", object_key),
                    };
                    Err(ApiError::internal_error().message(error_message))
                }
            }
            Err(err) => Err(ApiError::internal_error()
                .message("Failed to send upload_backup request".to_string() + &err.to_string())),
        }
    }

    pub async fn delete_backup(&self, object_key: &str) -> Result<(), ApiError> {
        let delete_object = self
            .backup_bucket
            .delete_object(Some(&self.credentials), &object_key);

        let expires_in = Duration::from_secs(600);
        let url = delete_object.sign(expires_in);

        match reqwest::Client::new().delete(url).send().await {
            Ok(res) => {
                if res.status().is_success() {
                    Ok(())
                } else {
                    let error_message = match res.text().await {
                        Ok(text) => format!(
                            "Failed to delete backup: {}, Response: {}",
                            object_key, text
                        ),
                        Err(_) => format!("Failed to delete backup: {}", object_key),
                    };
                    Err(ApiError::internal_error().message(error_message))
                }
            }
            Err(err) => Err(ApiError::internal_error()
                .message("Failed to send backup DELETE request".to_string() + &err.to_string())),
        }
    }

    pub async fn get_backup(&self, object_key: &str) -> Result<Vec<u8>, ApiError> {
        let get_object = self
            .backup_bucket
            .get_object(Some(&self.credentials), &object_key);

        let expires_in = Duration::from_secs(600);
        let url = get_object.sign(expires_in);

        match reqwest::Client::new().get(url).send().await {
            Ok(res) => {
                if res.status().is_success() {
                    let bytes = res
                        .bytes()
                        .await
                        .map_err(|e| ApiError::internal_error().message(e))?;
                    Ok(bytes.to_vec())
                } else {
                    let error_message = match res.text().await {
                        Ok(text) => {
                            format!("Failed to get backup: {}, Response: {}", object_key, text)
                        }
                        Err(_) => format!("Failed to get backup: {}", object_key),
                    };

                    Err(ApiError::internal_error().message(error_message))
                }
            }
            Err(err) => Err(ApiError::internal_error()
                .message("Failed to send backup GET request".to_string() + &err.to_string())),
        }
    }
}
