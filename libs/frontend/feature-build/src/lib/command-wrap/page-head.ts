import { pushCommand, pushCommandObject } from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData, ISetPageHeadData } from '@pubstudio/shared/type-command-data'
import { IHeadMeta, IHeadObject, IPageHeadTag, ISite } from '@pubstudio/shared/type-site'

const getOldHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
): IHeadObject | string | undefined => {
  const head = site.pages[route]?.head
  if (!head) {
    return undefined
  } else if (tag === 'title') {
    return head.title
  } else {
    return (head[tag] as unknown[])?.[index] as IHeadObject
  }
}

const makeSetPageHeadCommand = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number | undefined,
  value: IHeadObject | string | undefined,
): ICommand<ISetPageHeadData> => {
  const oldValue = index === undefined ? undefined : getOldHead(site, route, tag, index)
  return {
    type: CommandType.SetPageHead,
    data: {
      route,
      tag,
      index: index ?? 0,
      newValue: value,
      oldValue,
    },
  }
}

export const addPageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  value: IHeadObject | string,
) => {
  const cmd = makeSetPageHeadCommand(site, route, tag, undefined, value)
  pushCommandObject(site, cmd)
}

export const setPageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
  value: IHeadObject | string,
) => {
  const cmd = makeSetPageHeadCommand(site, route, tag, index, value)
  pushCommandObject(site, cmd)
}

export const removePageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
) => {
  const cmd = makeSetPageHeadCommand(site, route, tag, index, undefined)
  pushCommandObject(site, cmd)
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
  const cmds: ICommand[] = []
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
  cmds.push(makeSetPageHeadCommand(site, route, 'meta', index, desc))
  cmds.push(makeSetPageHeadCommand(site, route, 'meta', ogIndex, ogDesc))
  const data: ICommandGroupData = { commands: cmds }
  pushCommandObject(site, { type: CommandType.Group, data })
}

export const setPageFavicon = (
  site: ISite,
  route: string,
  newFavicon: string | undefined,
) => {
  const page = site.pages[route]
  if (page) {
    const index = page.head.link?.findIndex((link) => link.rel === 'icon') ?? 0
    const oldValue = index === -1 ? undefined : page.head.link?.[index]
    const data: ISetPageHeadData = {
      route: page.route,
      tag: 'link',
      index: index === -1 ? 0 : index,
      oldValue,
      newValue: {
        href: newFavicon,
        rel: 'icon',
      },
    }
    pushCommand(site, CommandType.SetPageHead, data)
  }
}
