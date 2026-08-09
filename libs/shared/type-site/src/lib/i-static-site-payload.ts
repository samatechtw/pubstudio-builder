import { IStoredSite } from './i-stored-site'

// Site data inlined into SSG pages as `window.__PUBSTUDIO_SITE__`. Produced by
// apps/ssg, consumed by the hydration runtime (apps/web-site). The fields are
// the IStoredSite encoding, so the payload is passed straight to unstoreSite.
export type IStaticSitePayload = Pick<
  IStoredSite,
  'name' | 'version' | 'defaults' | 'context' | 'pages' | 'pageOrder'
> & {
  id?: string
}
