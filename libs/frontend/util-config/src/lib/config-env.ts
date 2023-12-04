import { ExecEnv } from '@pubstudio/shared/util-core'

export const SITE_API_URL = import.meta.env?.VITE_SITE_API_URL || ''
export const SITE_ID = import.meta.env?.VITE_SITE_ID || ''
export const EXEC_ENV = import.meta.env?.VITE_EXEC_ENV || ExecEnv.Development

export const WEB_URL = import.meta.env?.VITE_WEB_URL
export const RELEASE_VERSION = import.meta.env?.VITE_RELEASE_VERSION

export const SITE_FORMAT_VERSION = import.meta.env?.VITE_SITE_FORMAT_VERSION

// Image optimization API
export const IMAGE_API_URL = import.meta.env?.VITE_IMAGE_API_URL || ''
export const IMAGE_API_KEY = import.meta.env?.VITE_IMAGE_API_KEY || ''

// S3 public bucket URLs
export const S3_SITE_ASSETS_URL = import.meta.env?.VITE_S3_SITE_ASSETS_URL || ''
export const S3_TEMPLATES_PREVIEWS_URL =
  import.meta.env?.VITE_S3_TEMPLATE_PREVIEWS_URL || ''
