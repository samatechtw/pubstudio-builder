import { triggerEditorEvent } from '@pubstudio/frontend/util-build'
import { ISetHomePageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'

export const applySetHomePage = (site: ISite, data: ISetHomePageData) => {
  const { newRoute } = data
  if (!(newRoute in site.pages)) {
    throw new Error(`Cannot find page with route ${newRoute}`)
  }
  if (site.defaults.homePage !== newRoute) {
    site.defaults.homePage = newRoute
    // Trigger page change event
    triggerEditorEvent(site, EditorEventName.OnPageChange)
  }
}

export const undoSetHomePage = (site: ISite, data: ISetHomePageData) => {
  const { oldRoute } = data
  if (!(oldRoute in site.pages)) {
    throw new Error(`Cannot find page with route ${oldRoute}`)
  }
  site.defaults.homePage = oldRoute
  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
}
