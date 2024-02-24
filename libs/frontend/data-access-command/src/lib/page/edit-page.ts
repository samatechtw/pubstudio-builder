import { IEditPageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'
import { triggerEditorEvent } from '../editor-event-handlers'
import { setActivePage } from '../set-active-page'

export const applyEditPage = (site: ISite, data: IEditPageData) => {
  const { oldMetadata, newMetadata } = data
  const oldPage = site.pages[oldMetadata.route]

  if (oldPage) {
    if (oldMetadata.route === newMetadata.route) {
      // Update existing page
      Object.assign(oldPage, newMetadata)
    } else {
      // Replace old page with new page
      const root = oldPage.root
      site.pages[newMetadata.route] = {
        ...newMetadata,
        root,
      }
      delete site.pages[oldPage.route]
      setActivePage(site.editor, newMetadata.route)

      // Update home page
      if (site.defaults.homePage === oldPage.route) {
        site.defaults.homePage = newMetadata.route
      }
    }
    // Trigger page change event
    triggerEditorEvent(site, EditorEventName.OnPageChange)
  }
}

export const undoEditPage = (site: ISite, data: IEditPageData) => {
  const { oldMetadata, newMetadata } = data
  const newPage = site.pages[newMetadata.route]

  if (newPage) {
    if (newMetadata.route === oldMetadata.route) {
      // Update existing page
      Object.assign(newPage, oldMetadata)
    } else {
      // Replace new page with old page
      const root = newPage.root
      site.pages[oldMetadata.route] = {
        ...oldMetadata,
        root,
      }
      delete site.pages[newPage.route]
      setActivePage(site.editor, oldMetadata.route)

      // Update home page
      if (site.defaults.homePage === newPage.route) {
        site.defaults.homePage = oldMetadata.route
      }
    }
    // Trigger page change event
    triggerEditorEvent(site, EditorEventName.OnPageChange)
  }
}
