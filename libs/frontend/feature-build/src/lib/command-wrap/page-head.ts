import { pushCommandObject } from '@pubstudio/frontend/data-access-command'
import { makeSetPageHead } from '@pubstudio/frontend/util-command-data'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { IHeadMeta, IHeadObject, IPageHeadTag, ISite } from '@pubstudio/shared/type-site'

export const addPageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  value: IHeadObject,
) => {
  pushCommandObject(site, makeSetPageHead(site, route, tag, undefined, value))
}

export const setPageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
  value: IHeadObject,
) => {
  pushCommandObject(site, makeSetPageHead(site, route, tag, index, value))
}

export const removePageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
) => {
  pushCommandObject(site, makeSetPageHead(site, route, tag, index, undefined))
}

type PageMetaPredicate = (m: IHeadMeta) => boolean

// Returns current index of head entry, or 0 if it doesn't exist
const getHeadIndex = (
  site: ISite,
  route: string,
  tag: 'meta',
  pred: PageMetaPredicate,
): number => {
  const page = site.pages[route]
  const index = page?.head?.[tag]?.findIndex(pred) ?? 0
  return index === -1 ? 0 : index
}

export const setPageDescription = (site: ISite, route: string, value: string) => {
  const index = getHeadIndex(site, route, 'meta', (m) => m.name === 'description')
  const ogIndex = getHeadIndex(
    site,
    route,
    'meta',
    (m) => m.property === 'og:description',
  )
  const desc: IHeadObject = {
    name: 'description',
    content: value,
  }
  const ogDesc: IHeadObject = {
    property: 'og:description',
    content: value,
  }
  const commands: ICommand[] = [
    makeSetPageHead(site, route, 'meta', index, desc),
    makeSetPageHead(site, route, 'meta', ogIndex, ogDesc),
  ]
  const data: ICommandGroupData = { commands }
  pushCommandObject(site, { type: CommandType.Group, data })
}

export const setPageFavicon = (
  site: ISite,
  route: string,
  newFavicon: string | undefined,
) => {
  const page = site.pages[route]
  if (page) {
    const index = page.head.link?.findIndex((link) => link.rel === 'icon') ?? -1
    const favicon = { href: newFavicon, rel: 'icon' }
    pushCommandObject(
      site,
      makeSetPageHead(site, route, 'link', index === -1 ? undefined : index, favicon),
    )
  }
}
