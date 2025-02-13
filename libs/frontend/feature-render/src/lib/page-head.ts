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

interface IRenderSiteHead {
  title: string
  meta: IHeadMeta[]
  link: IHeadLink[]
  script: IHeadScript[]
}

const keySel = (p: string, k: string | undefined): string => (k ? `[${p}='${k}']` : '')

const metaKey = (meta: IHeadMeta) => {
  const { 'http-equiv': equiv, property, name } = meta
  return `${keySel('http-equiv', equiv)}${keySel('property', property)}${keySel('name', name)}`
}

export const getHead = (
  site: ISite | undefined,
  activePage: IPage | undefined,
): IRenderSiteHead => {
  const link = [
    ...(site?.defaults.head.link ?? []),
    ...(activePage?.head.link ?? []),
  ].map((l) => (l.rel === 'icon' ? { ...l, key: 'favicon' } : l))

  const activePageTitle = activePage?.head.title || activePageName(activePage)

  const script: IHeadScript[] = [
    ...(site?.defaults.head.script ?? []),
    ...(activePage?.head.script ?? []),
  ]
  // Merge meta
  const description = activePage?.head.description ?? site?.defaults.head.description
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
    ...(activePage?.head.meta ?? []),
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

const keyFn = (tag: IHeadMeta | IHeadScript | IHeadLink) =>
  Object.entries(tag).reduce((a, b) => `${a}${keySel(b[0], b[1])}`, '')

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
  oldTags.forEach((_t, key) => {
    if (tag === 'meta' || !newTags.has(key)) {
      document.querySelector(`${tag}${key}`)?.remove()
    }
  })
  // Add new tags
  newTags.forEach((t, key) => {
    if (tag === 'meta' || !oldTags.has(key)) {
      if (tag === 'meta') {
        document.querySelector(`${tag}${key}`)?.remove()
      }
      const newElement = document.createElement(tag)
      Object.keys(t).forEach((attr) => newElement.setAttribute(attr, t[attr]))
      document.head.appendChild(newElement)
    }
  })
}

export const replaceHead = (site: ISite, page: IPage, oldPage: IPage | undefined) => {
  const head = getHead(site, page)
  const oldHead = getHead(site, oldPage)
  document.title = head.title
  updateTags('meta', head, oldHead)
  updateTags('link', head, oldHead)
  updateTags('script', head, oldHead)
}
