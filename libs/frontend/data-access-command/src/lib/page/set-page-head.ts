import { ISetPageHeadData } from '@pubstudio/shared/type-command-data'
import {
  IHeadObject,
  IPageHead,
  IPageHeadObject,
  IPageHeadTag,
  ISite,
} from '@pubstudio/shared/type-site'

const removeHeadField = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
) => {
  // TODO -- find a better way to handle these types
  const page = site.pages[route]
  if (page) {
    if (tag === 'title') {
      page.head.title = undefined
    } else {
      const head = page.head[tag as keyof IPageHead] as IPageHeadObject[]
      if (head) {
        head.splice(index, 1)
      }
      if (head.length === 0) {
        page.head[tag as keyof IPageHead] = undefined
      }
    }
  }
}

const setHeadField = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
  newValue: IHeadObject | string,
) => {
  const page = site.pages[route]
  if (page) {
    if (tag === 'title') {
      page.head.title = newValue as string
    } else {
      const tagObj = page.head[tag] as IPageHeadObject[]
      tagObj[index] = newValue as IHeadObject
    }
  }
}

const addHeadField = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
  newValue: IHeadObject | string,
) => {
  const page = site.pages[route]
  if (page) {
    if (tag === 'title') {
      page.head.title = newValue as string
    } else {
      const head = page.head[tag as keyof IPageHead] as IPageHeadObject[]
      if (head) {
        head.splice(index, 0, newValue as IHeadObject)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        page.head[tag as keyof IPageHead] = [newValue] as any
      }
    }
  }
}

const setEvents = (
  site: ISite,
  route: string,
  tag: IPageHeadTag,
  index: number,
  oldValue: IHeadObject | string | undefined,
  newValue: IHeadObject | string | undefined,
) => {
  // Remove
  if (oldValue && !newValue) {
    removeHeadField(site, route, tag, index)
  } else if (oldValue && newValue) {
    setHeadField(site, route, tag, index, newValue)
  } else if (!oldValue && newValue) {
    addHeadField(site, route, tag, index, newValue)
  } else {
    console.error('set-page-head no val', oldValue, newValue)
  }
}

export const applySetPageHead = (site: ISite, data: ISetPageHeadData) => {
  const { route, tag, index, oldValue, newValue } = data
  setEvents(site, route, tag, index, oldValue, newValue)
}

export const undoSetPageHead = (site: ISite, data: ISetPageHeadData) => {
  const { route, tag, index, oldValue, newValue } = data
  setEvents(site, route, tag, index, newValue, oldValue)
}
