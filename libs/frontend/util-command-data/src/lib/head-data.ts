import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ISetDefaultsHeadData,
  ISetPageHeadData,
} from '@pubstudio/shared/type-command-data'
import {
  IHead,
  IHeadObject,
  IHeadTag,
  IPageHeadTag,
  ISite,
} from '@pubstudio/shared/type-site'

// `title` and `description` are single strings; every other tag is an indexed list
const headValue = (
  head: IHead | undefined,
  tag: IHeadTag,
  index: number,
): IHeadObject | undefined => {
  if (!head) {
    return undefined
  } else if (tag === 'title' || tag === 'description') {
    return head[tag]
  } else if (tag === 'base') {
    return head.base
  }
  return head[tag]?.[index]
}

export const pageHeadValue = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
): IHeadObject | undefined => headValue(site.pages[route]?.head, tag, index)

export const defaultsHeadValue = (
  site: ISite,
  tag: IHeadTag,
  index: number,
): IHeadObject | undefined => headValue(site.defaults.head, tag, index)

// An undefined `index` appends a new entry; an undefined `value` removes the entry at `index`
export const makeSetPageHeadData = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number | undefined,
  value: IHeadObject | undefined,
): ISetPageHeadData => ({
  route,
  tag,
  index: index ?? 0,
  oldValue: index === undefined ? undefined : pageHeadValue(site, route, tag, index),
  newValue: value,
})

export const makeSetPageHead = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number | undefined,
  value: IHeadObject | undefined,
): ICommand<ISetPageHeadData> => ({
  type: CommandType.SetPageHead,
  data: makeSetPageHeadData(site, route, tag, index, value),
})

export const makeSetDefaultsHeadData = (
  site: ISite,
  tag: IHeadTag,
  index: number | undefined,
  value: IHeadObject | undefined,
): ISetDefaultsHeadData => ({
  tag,
  index: index ?? 0,
  oldValue: index === undefined ? undefined : defaultsHeadValue(site, tag, index),
  newValue: value,
})
