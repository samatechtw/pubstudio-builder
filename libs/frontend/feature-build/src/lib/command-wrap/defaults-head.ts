import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISetDefaultsHeadData } from '@pubstudio/shared/type-command-data'
import { IHeadObject, IHeadTag, ISite } from '@pubstudio/shared/type-site'

export const setFavicon = (site: ISite, newFavicon: string | undefined) => {
  const index = site.defaults.head.link?.findIndex((link) => link.rel === 'icon') ?? 0
  const oldValue = index === -1 ? undefined : site.defaults.head.link?.[index]
  const data: ISetDefaultsHeadData = {
    tag: 'link',
    index: index === -1 ? 0 : index,
    oldValue,
    newValue: {
      href: newFavicon,
      rel: 'icon',
    },
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}

export const setTitle = (site: ISite, newTitle: string | undefined) => {
  const data: ISetDefaultsHeadData = {
    tag: 'title',
    index: 0,
    oldValue: site.defaults.head.title,
    newValue: newTitle,
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}

export const setDescription = (site: ISite, newDescription: string | undefined) => {
  const data: ISetDefaultsHeadData = {
    tag: 'description',
    index: 0,
    oldValue: site.defaults.head.description,
    newValue: newDescription,
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}

export const addDefaultsHead = (site: ISite, tag: IHeadTag, value: IHeadObject) => {
  const data: ISetDefaultsHeadData = {
    tag,
    index: 0,
    newValue: value,
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}

export const setDefaultsHead = (
  site: ISite,
  tag: IHeadTag,
  index: number,
  value: IHeadObject,
) => {
  let oldValue: IHeadObject | undefined
  if (tag === 'base') {
    oldValue = site.defaults.head.base
  } else {
    oldValue = site.defaults.head[tag]?.[index] as IHeadObject
  }
  const data: ISetDefaultsHeadData = {
    tag,
    index,
    oldValue,
    newValue: value,
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}

export const removeDefaultsHead = (site: ISite, tag: IHeadTag, index: number) => {
  let oldValue: IHeadObject | undefined
  if (tag === 'base') {
    oldValue = site.defaults.head.base
  } else {
    oldValue = site.defaults.head[tag]?.[index] as IHeadObject
  }
  const data: ISetDefaultsHeadData = {
    tag,
    index,
    oldValue,
  }
  pushCommand(site, CommandType.SetDefaultsHead, data)
}
