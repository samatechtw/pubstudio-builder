// Site input for static generation. Field encoding matches the site DB
// columns / API responses: `defaults`/`context`/`pages`/`pageOrder` are
// JSON-encoded strings (possibly nested-encoded — see `parseJsonField`).
// Plain objects are also accepted for convenience (e.g. CLI fixture files).
export interface ISsgSiteInput {
  id?: string
  name: string
  version: string
  defaults: unknown
  context: unknown
  pages: unknown
  pageOrder?: unknown
  // Timestamp of the published site version (ISO string or epoch millis),
  // echoed back in the result and used as sitemap <lastmod>.
  updated_at?: string | number | null
}

export interface ISsgOptions {
  // Canonical site origin (e.g. https://example.com) for sitemap/robots URLs
  baseUrl?: string
  // Omit the hydration payload + runtime script (zero-JS output)
  noJs?: boolean
  // Generate noJs output even when the capability detector reports blockers
  force?: boolean
  // Src of the shared hydration runtime script tag
  runtimeSrc?: string
}

export interface IStaticPage {
  route: string
  body: string
  contentType: string
}

export interface ISsgResult {
  pages: IStaticPage[]
  // Interactive features that require the hydration runtime (noJs blockers)
  blockers: string[]
  warnings: string[]
  noJs: boolean
  siteVersion: string
  updatedAt?: string | number | null
  generator: string
}

export const SSG_VERSION = '0.1.0'
export const SSG_GENERATOR = `pubstudio-ssg/${SSG_VERSION}`
export const DEFAULT_RUNTIME_SRC = '/_ps/site.js'
