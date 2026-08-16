import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { makeSetDefaultsHeadData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import { IHeadObject, IHeadTag, ISite } from '@pubstudio/shared/type-site'

const pushSetDefaultsHead = (
  site: ISite,
  tag: IHeadTag,
  index: number | undefined,
  value: IHeadObject | undefined,
) => {
  pushCommand(
    site,
    CommandType.SetDefaultsHead,
    makeSetDefaultsHeadData(site, tag, index, value),
  )
}

export const setFavicon = (site: ISite, newFavicon: string | undefined) => {
  const index = site.defaults.head.link?.findIndex((link) => link.rel === 'icon') ?? -1
  pushSetDefaultsHead(site, 'link', index === -1 ? undefined : index, {
    href: newFavicon,
    rel: 'icon',
  })
}

export const setTitle = (site: ISite, newTitle: string | undefined) => {
  pushSetDefaultsHead(site, 'title', 0, newTitle)
}

export const setDescription = (site: ISite, newDescription: string | undefined) => {
  pushSetDefaultsHead(site, 'description', 0, newDescription)
}

export const addDefaultsHead = (site: ISite, tag: IHeadTag, value: IHeadObject) => {
  pushSetDefaultsHead(site, tag, undefined, value)
}

export const setDefaultsHead = (
  site: ISite,
  tag: IHeadTag,
  index: number,
  value: IHeadObject,
) => {
  pushSetDefaultsHead(site, tag, index, value)
}

export const removeDefaultsHead = (site: ISite, tag: IHeadTag, index: number) => {
  pushSetDefaultsHead(site, tag, index, undefined)
}
