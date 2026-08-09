import {
  ISerializedPage,
  ISerializedSite,
  ISerializedSiteContext,
  ISiteDefaults,
} from '@pubstudio/shared/type-site'
import { ISsgSiteInput } from './ssg-types'

// Site DB columns hold JSON-encoded strings, and passing them through the API
// adds another encoding layer, so a field may arrive as an object, a JSON
// string, or a JSON string wrapping another JSON string. Unwrap until a
// non-string value appears.
export const parseJsonField = <T>(value: unknown): T | undefined => {
  let result: unknown = value
  let depth = 0
  while (typeof result === 'string' && depth < 3) {
    result = JSON.parse(result)
    depth += 1
  }
  return result === null ? undefined : (result as T)
}

export interface INormalizedSiteInput {
  serialized: ISerializedSite
  publicPages: Record<string, ISerializedPage>
}

export const normalizeSiteInput = (input: ISsgSiteInput): INormalizedSiteInput => {
  const defaults = parseJsonField<ISiteDefaults>(input.defaults)
  const context = parseJsonField<ISerializedSiteContext>(input.context)
  const pages = parseJsonField<Record<string, ISerializedPage>>(input.pages)
  const pageOrder = parseJsonField<string[]>(input.pageOrder)
  if (!defaults || !context || !pages) {
    throw new Error('Site input is missing defaults, context, or pages')
  }
  const publicPages: Record<string, ISerializedPage> = {}
  for (const [key, page] of Object.entries(pages)) {
    if (page.public) {
      publicPages[key] = page
    }
  }
  const serialized: ISerializedSite = {
    name: input.name,
    version: input.version,
    defaults,
    context,
    pages: publicPages,
    pageOrder:
      pageOrder?.filter((route) => route in publicPages) ?? Object.keys(publicPages),
    history: { back: [], forward: [] },
    updated_at: input.updated_at ?? undefined,
  }
  return { serialized, publicPages }
}
