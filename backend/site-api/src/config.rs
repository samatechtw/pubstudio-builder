/// App configuration
///
/// Passed via command line, or environment variables.
use clap::Parser;
use lib_shared_types::shared::core::ExecEnv;
use sqlx::sqlite::SqliteJournalMode;

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

    /// Journal mode for metadata and site sqlite databases. WAL requires coherent
    /// shared memory across connections, which VM-shared filesystems don't provide.
    /// Deployments storing site data on such mounts should use "truncate" or "delete"
    #[clap(long, env = "SQLITE_JOURNAL_MODE", default_value = "wal")]
    pub sqlite_journal_mode: SqliteJournalMode,

    /// The API host
    #[clap(long, env = "SITE_API_HOST")]
    pub api_host: String,

    /// The API port
    #[clap(long, env = "SITE_API_PORT")]
    pub api_port: u16,

    /// API key used for single user self-hosting
    #[clap(long, env = "AUTH_BYPASS_API_KEY")]
    pub auth_bypass_api_key: Option<String>,

    /// URL of the SSG service used to prerender published sites to static
    /// pages. Static generation is skipped when unset.
    #[clap(long, env = "SSG_URL")]
    pub ssg_url: Option<String>,

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

    /// Maximum number of backups stored
    #[clap(long, env = "MAX_BACKUPS", default_value_t = 10)]
    pub max_backups: u32,

    /// API key for sending email via MailerSend
    #[clap(long, env = "MAILSENDER_API_KEY")]
    pub mailsender_api_key: String,
}
