// Site data inlined into statically generated pages as
// `window.__PUBSTUDIO_SITE__`. Field encoding matches IStoredSite
// (single-encoded JSON strings), the shape unstoreSite consumes directly.
// Produced by apps/ssg, consumed by the hydration runtime (apps/web-site).
export interface IStaticSitePayload {
  id?: string
  name: string
  version: string
  defaults: string
  context: string
  pages: string
  pageOrder?: string
}
