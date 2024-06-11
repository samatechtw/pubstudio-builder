import { ISetHomePageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'
import { triggerEditorEvent } from '../editor-event-handlers'
import { editPageOrderHelper } from './edit-page'

export const applySetHomePage = (site: ISite, data: ISetHomePageData) => {
  const { newRoute, oldPos } = data
  if (!(newRoute in site.pages)) {
    throw new Error(`Cannot find page with route ${newRoute}`)
  }
  if (site.defaults.homePage !== newRoute) {
    site.defaults.homePage = newRoute
    // Move page to front
    if (oldPos > 0) {
      editPageOrderHelper(site, oldPos, 0)
    }
    // Trigger page change event
    triggerEditorEvent(site, EditorEventName.OnPageChange)
  }
}

export const undoSetHomePage = (site: ISite, data: ISetHomePageData) => {
  const { oldRoute, oldPos } = data
  if (!(oldRoute in site.pages)) {
    throw new Error(`Cannot find page with route ${oldRoute}`)
  }
  site.defaults.homePage = oldRoute
  // Move page back to original position
  if (oldPos > 0) {
    editPageOrderHelper(site, 0, oldPos)
  }
  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
}
