import {
  IHeadLink,
  IHeadMeta,
  IHeadScript,
  IPage,
  ISite,
} from '@pubstudio/shared/type-site'

const activePageName = (activePage: IPage | undefined) => {
  {
    const pageName = activePage?.name || ''
    if (!pageName || !activePage?.public) {
      return 'Pub Studio'
    }
    return pageName
  }
}

export interface IRenderSiteHead {
  title: string
  meta: IHeadMeta[]
  link: IHeadLink[]
  script: IHeadScript[]
}

const keySel = (p: string, k: string | undefined): string =>
  k === undefined ? '' : `[${p}='${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`

const metaKey = (meta: IHeadMeta) => {
  const { 'http-equiv': equiv, property, name } = meta
  return `${keySel('http-equiv', equiv)}${keySel('property', property)}${keySel('name', name)}`
}

export function getHead(site: ISite | undefined, activePage: IPage): IRenderSiteHead
export function getHead(
  site: ISite | undefined,
  activePage: IPage | undefined,
): IRenderSiteHead | undefined

export function getHead(
  site: ISite | undefined,
  activePage: IPage | undefined,
): IRenderSiteHead | undefined {
  if (activePage === undefined) {
    return undefined
  }
  const link = [...(site?.defaults.head.link ?? []), ...(activePage.head.link ?? [])].map(
    (l) => (l.rel === 'icon' ? { ...l, key: 'favicon' } : l),
  )

  const activePageTitle = activePage.head.title || activePageName(activePage)

  const script: IHeadScript[] = [
    ...(site?.defaults.head.script ?? []),
    ...(activePage.head.script ?? []),
  ]
  // Merge meta. site?.name matches what platform-api substitutes into the SPA shell.
  const description =
    activePage.head.description ??
    site?.defaults.head.description ??
    site?.name ??
    'PubStudio Site'
  const meta = [
    {
      name: 'description',
      content: description,
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'og:title',
      content: activePageTitle,
    },
    {
      property: 'twitter:title',
      content: activePageTitle,
    },
    ...(site?.defaults.head.meta ?? []),
    ...(activePage.head.meta ?? []),
  ]
  const metaDedup = new Map()
  for (const m of meta) {
    const mKey = metaKey(m)
    metaDedup.set(mKey, m)
  }
  return {
    title: activePageTitle,
    meta: Array.from(metaDedup.values()),
    link,
    script,
  }
}

const tagAttributes = (tag: IHeadMeta | IHeadScript | IHeadLink) =>
  Object.entries(tag)
    .filter(
      ([attr, value]) =>
        value !== undefined && value !== null && value !== false && attr !== 'key',
    )
    .map(([attr, value]) => [attr, value === true ? '' : String(value)])
    .sort(([a], [b]) => a.localeCompare(b))

const keyFn = (tag: IHeadMeta | IHeadScript | IHeadLink) =>
  JSON.stringify(tagAttributes(tag))

const findTag = (
  tag: 'meta' | 'script' | 'link',
  attrs: IHeadMeta | IHeadScript | IHeadLink,
) => {
  if (tag === 'meta') return document.querySelector(`meta${metaKey(attrs as IHeadMeta)}`)
  const key = keyFn(attrs)
  return Array.from(document.querySelectorAll(tag)).find((element) => {
    const attributes = Object.fromEntries(
      Array.from(element.attributes).map((attr) => [attr.name, attr.value]),
    )
    return keyFn(attributes) === key
  })
}

// Update scripts/links.
function updateTags(
  tag: 'meta' | 'script' | 'link',
  head: IRenderSiteHead,
  oldHead: IRenderSiteHead | undefined,
) {
  const oldTags = new Map()
  oldHead?.[tag]?.forEach((t) =>
    // TODO -- this is a hack to always delete/create meta tags. There is a complication with
    // clearing the default meta tags that was causing duplicates. This can probably be optimized
    // and cleaned up quite a bit
    oldTags.set(tag === 'meta' ? metaKey(t as IHeadMeta) : keyFn(t), t),
  )

  const newTags = new Map()
  head[tag]?.forEach((t) =>
    newTags.set(tag === 'meta' ? metaKey(t as IHeadMeta) : keyFn(t), t),
  )

  // Remove outdated tags
  oldTags.forEach((t, key) => {
    if (tag === 'meta' || !newTags.has(key)) {
      findTag(tag, t)?.remove()
    }
  })
  // Add new tags
  newTags.forEach((t, key) => {
    if (tag === 'meta' || !oldTags.has(key)) {
      if (tag === 'meta') {
        findTag(tag, t)?.remove()
      }
      // Reuse prerendered links/scripts on the first hydration update.
      if (tag !== 'meta' && findTag(tag, t)) return
      const newElement = document.createElement(tag)
      if (tag === 'script') {
        // Dynamic scripts default to async, even when the attribute is absent.
        // Preserve dependency order unless the author explicitly opts into async.
        ;(newElement as HTMLScriptElement).async = t.async === true
      }
      Object.entries(t).forEach(([attr, value]) => {
        if (value !== undefined && value !== null && value !== false && attr !== 'key') {
          newElement.setAttribute(attr, value === true ? '' : String(value))
        }
      })
      document.head.appendChild(newElement)
    }
  })
}

export const replaceHead = (
  site: ISite | undefined,
  page: IPage | undefined,
  oldPage: IPage | undefined,
) => {
  if (!site || !page) {
    return
  }
  const head = getHead(site, page)
  const oldHead = getHead(site, oldPage)
  document.title = head.title
  updateTags('meta', head, oldHead)
  updateTags('link', head, oldHead)
  updateTags('script', head, oldHead)
}
