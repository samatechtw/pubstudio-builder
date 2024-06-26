import { ISetDefaultsHeadData } from '@pubstudio/shared/type-command-data'
import {
  IHead,
  IHeadBase,
  IHeadObject,
  IHeadTag,
  IPageHeadObject,
  ISite,
} from '@pubstudio/shared/type-site'

const removeHeadField = (site: ISite, tag: IHeadTag, index: number) => {
  if (tag === 'base') {
    site.defaults.head.base = undefined
  } else if (tag === 'title') {
    site.defaults.head.title = undefined
  } else if (tag === 'description') {
    site.defaults.head.description = undefined
  } else {
    // TODO -- find a better way to handle these types
    const head = site.defaults.head[tag as keyof IHead] as IPageHeadObject[]
    head.splice(index, 1)
    if (head.length === 0) {
      site.defaults.head[tag as keyof IHead] = undefined
    }
  }
}

const setHeadField = (
  site: ISite,
  tag: IHeadTag,
  index: number,
  newValue: IHeadObject,
) => {
  if (tag === 'base') {
    site.defaults.head.base = newValue as IHeadBase
  } else if (tag === 'title') {
    site.defaults.head.title = newValue as string
  } else if (tag === 'description') {
    site.defaults.head.description = newValue as string
  } else {
    const tagObj = site.defaults.head[tag as keyof IHead] as IHeadObject[]
    tagObj[index] = newValue
  }
}

const addHeadField = (
  site: ISite,
  tag: IHeadTag,
  index: number,
  newValue: IHeadObject,
) => {
  if (tag === 'base') {
    site.defaults.head.base = newValue as IHeadBase
  } else if (tag === 'title') {
    site.defaults.head.title = newValue as string
  } else if (tag === 'description') {
    site.defaults.head.description = newValue as string
  } else {
    const head = site.defaults.head[tag as keyof IHead] as IHeadObject[]
    if (head) {
      head.splice(index, 0, newValue)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      site.defaults.head[tag as keyof IHead] = [newValue] as any
    }
  }
}

const setEvents = (
  site: ISite,
  tag: IHeadTag,
  index: number,
  oldValue: IHeadObject | undefined,
  newValue: IHeadObject | undefined,
) => {
  // Remove
  if (oldValue && !newValue) {
    removeHeadField(site, tag, index)
  } else if (oldValue && newValue) {
    setHeadField(site, tag, index, newValue)
  } else if (!oldValue && newValue) {
    addHeadField(site, tag, index, newValue)
  } else {
    console.error('set-defaults-head no val', oldValue, newValue)
  }
}

export const applySetDefaultsHead = (site: ISite, data: ISetDefaultsHeadData) => {
  const { tag, index, oldValue, newValue } = data
  setEvents(site, tag, index, oldValue, newValue)
}

export const undoSetDefaultsHead = (site: ISite, data: ISetDefaultsHeadData) => {
  const { tag, index, oldValue, newValue } = data
  setEvents(site, tag, index, newValue, oldValue)
}
