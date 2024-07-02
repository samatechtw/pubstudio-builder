/// App configuration
///
/// Passed via command line, or environment variables.
use clap::Parser;
use lib_shared_types::shared::core::ExecEnv;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Config {
    /// The app directory
    #[clap(long, default_value = ".")]
    pub manifest_dir: String,

    /// The sqlite connection URL
    #[clap(long, env = "EXEC_ENV")]
    pub exec_env: ExecEnv,

    /// The web URL where the site builder/platform is hosted
    #[clap(long, env = "PLATFORM_WEB_URL")]
    pub platform_web_url: String,

    /// The sqlite connection URL
    #[clap(long, env = "DATABASE_URL")]
    pub database_url: String,

    /// The API host
    #[clap(long, env = "SITE_API_HOST")]
    pub api_host: String,

    /// The API port
    #[clap(long, env = "SITE_API_PORT")]
    pub api_port: u16,

    /// API key used for single user self-hosting
    #[clap(long, env = "AUTH_BYPASS_API_KEY")]
    pub auth_bypass_api_key: Option<String>,

    /// Public key used to verify Admin
    #[clap(long, env = "SITE_ADMIN_PUBLIC_KEY")]
    pub admin_public_key: String,

    /// S3 endpoint
    #[clap(long, env = "S3_URL")]
    pub s3_url: String,

    /// S3 access key ID
    #[clap(long, env = "S3_ACCESS_KEY_ID")]
    pub s3_access_key_id: String,

    /// S3 secret key
    #[clap(long, env = "S3_SECRET_ACCESS_KEY")]
    pub s3_secret_access_key: String,

    /// API key for sending email via SendGrid
    #[clap(long, env = "SENDGRID_API_KEY")]
    pub sendgrid_api_key: String,
}
