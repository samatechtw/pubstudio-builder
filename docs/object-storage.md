# Object Storage

Each `Owner` user is allocated an amount of object storage according to their paid site plans, which can be used for uploading assets. Owners without paid plans get 10MB of storage for free.

[Cloudflare R2](https://developers.cloudflare.com/r2) is used for storage, but any S3 compatible service should work.

## Environment

The Platform API defines several environment variables for R2 API access:

- `S3_URL: https://<account-id>.r2.cloudflarestorage.com` - not secret
- `S3_ACCESS_KEY_ID: <access-key-id>` - not secret
- `S3_SECRET_ACCESS_KEY: <secret-access-key>` - secret

## Buckets

A Cloudflare account is set up for each environment (dev/stg/prod). Each account contains the following buckets:

- `platform-db-backups` - Private bucket for platform DB (postgres) backups.
- `site-assets` - Public bucket for Site asset management. File format: `<site-id>_<asset-name>.<content-type>`
- `site-backups` - Owner-private bucket for site DB backups, which are compressed sqlite3 databases. File format: `<site-id>_yyyyMMdd-HHmmss.tar.gz`
