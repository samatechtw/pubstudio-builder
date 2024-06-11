import { IEditPageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, IPageMetadata, ISite } from '@pubstudio/shared/type-site'
import { triggerEditorEvent } from '../editor-event-handlers'
import { setActivePage } from '../set-active-page'

const editPageHelper = (
  site: ISite,
  oldMetadata: IPageMetadata,
  newMetadata: IPageMetadata,
) => {
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
      const orderIndex = site.pageOrder.indexOf(oldPage.route)
      if (orderIndex !== -1) {
        site.pageOrder[orderIndex] = newMetadata.route
      }
      if (site.editor?.editPageRoute === oldMetadata.route) {
        site.editor.editPageRoute = newMetadata.route
      }

      // Update home page
      if (site.defaults.homePage === oldPage.route) {
        site.defaults.homePage = newMetadata.route
      }
    }
  }
}

export const editPageOrderHelper = (site: ISite, pos: number, newPos: number) => {
  const removed = site.pageOrder.splice(pos, 1)
  if (removed[0]) {
    site.pageOrder.splice(newPos, 0, removed[0])
  }
}

export const applyEditPage = (site: ISite, data: IEditPageData) => {
  const { oldMetadata, newMetadata, order } = data

  if (oldMetadata && newMetadata) {
    editPageHelper(site, oldMetadata, newMetadata)
  }
  if (order) {
    editPageOrderHelper(site, order.pos, order.newPos)
  }

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
}

export const undoEditPage = (site: ISite, data: IEditPageData) => {
  const { oldMetadata, newMetadata, order } = data

  if (oldMetadata && newMetadata) {
    editPageHelper(site, newMetadata, oldMetadata)
  }
  if (order) {
    editPageOrderHelper(site, order.newPos, order.pos)
  }
  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
}
