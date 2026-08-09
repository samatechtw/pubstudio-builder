import {
  ISerializedPage,
  ISerializedSite,
  ISerializedSiteContext,
  ISiteDefaults,
} from '@pubstudio/shared/type-site'
import { filterRecord } from '@pubstudio/shared/util-core'
import { ISsgSiteInput } from './ssg-types'

// Site DB columns hold JSON-encoded strings, and passing them through the API adds
// another encoding layer, so fields can arrive as objects, JSON strings, or a JSON
// string wrapping another JSON string. Unwrap until a non-string value appears.
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
  const publicPages = filterRecord(pages, (page) => !!page.public)
  const serialized: ISerializedSite = {
    name: input.name,
    version: input.version,
    defaults,
    context,
    pages: publicPages,
    pageOrder:
      pageOrder?.filter((route) => route in publicPages) ?? Object.keys(publicPages),
    history: { back: [], forward: [] },
    // Epoch millis from site API `SsgSiteDto`, or ISO string from a CLI fixture.
    updated_at: input.updated_at ? new Date(input.updated_at).toISOString() : undefined,
  }
  return { serialized, publicPages }
}
