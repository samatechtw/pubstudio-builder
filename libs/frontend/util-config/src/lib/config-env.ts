import { ExecEnv } from '@pubstudio/shared/util-core'

export const SITE_API_URL = import.meta.env?.VITE_SITE_API_URL || ''
// Hostname that cluster-internal Site API addresses are rewritten to in dev/CI.
// Override when the browser isn't running on the machine hosting the dev cluster.
export const DEV_SITE_API_HOST = import.meta.env?.VITE_DEV_SITE_API_HOST || '127.0.0.1'
// Explicit `<cluster address>=<browser address>` overrides, for a reverse proxy that changes
// the scheme or port as well as the host. Takes precedence over DEV_SITE_API_HOST.
export const DEV_SITE_API_MAP = import.meta.env?.VITE_DEV_SITE_API_MAP || ''
export const SITE_ID = import.meta.env?.VITE_SITE_ID || ''
export const EXEC_ENV = import.meta.env?.VITE_EXEC_ENV || ExecEnv.Development

export const WEB_URL =
  EXEC_ENV === ExecEnv.Production ? 'pubstud.io' : `${EXEC_ENV}.pubstud.io`
export const RELEASE_VERSION = import.meta.env?.VITE_RELEASE_VERSION

export const SITE_FORMAT_VERSION = import.meta.env?.VITE_SITE_FORMAT_VERSION

// Image optimization API
export const IMAGE_API_URL = import.meta.env?.VITE_IMAGE_API_URL || ''
export const IMAGE_API_KEY = import.meta.env?.VITE_IMAGE_API_KEY || ''

// S3 public bucket URLs
export const S3_SITE_ASSETS_URL = import.meta.env?.VITE_S3_SITE_ASSETS_URL || ''
export const S3_TEMPLATE_PREVIEWS_URL =
  import.meta.env.VITE_S3_TEMPLATE_PREVIEWS_URL || ''

export const builderConfig = {
  siteFormatVersion: SITE_FORMAT_VERSION,
  imageApiUrl: IMAGE_API_URL,
  imageApiKey: IMAGE_API_KEY,
  s3SiteAssetsUrl: S3_SITE_ASSETS_URL,
  s3TemplatePreviewsUrl: S3_TEMPLATE_PREVIEWS_URL,
}

export const setConfig = (config: Partial<typeof builderConfig>) => {
  for (const [key, val] of Object.entries(config)) {
    builderConfig[key as keyof typeof builderConfig] = val
  }
}
