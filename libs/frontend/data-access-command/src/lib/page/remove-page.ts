import { iteratePage } from '@pubstudio/frontend/util-render'
import { deserializePages } from '@pubstudio/frontend/util-site-deserialize'
import { IRemovePageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'
import { triggerEditorEvent } from '../editor-event-handlers'
import { setEditPage } from '../editor-helpers'
import { setActivePage } from '../set-active-page'
import { setSelectedComponent } from '../set-selected-component'

export const applyRemovePage = (site: ISite, data: IRemovePageData) => {
  const { pageRoute } = data
  const pageRoutes = Object.keys(site.pages)
  // Make sure we don't delete the only page in the site
  if (pageRoutes.length < 2) {
    throw new Error('Cannot remove page when page count is less than 2')
  }

  // Clear editor state
  iteratePage(site.pages[pageRoute], (component) => {
    delete site.editor?.componentTreeExpandedItems[component.id]
    delete site.editor?.componentsHidden[component.id]
  })

  // Remove page
  delete site.pages[pageRoute]
  site.pageOrder = site.pageOrder.filter((route) => route !== pageRoute)

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageRemove)

  // Set active page to another one
  const nextActivePageRoute = pageRoutes.find((route) => route !== pageRoute) as string
  setSelectedComponent(site, undefined)
  setActivePage(site.editor, nextActivePageRoute, true)
  // Close page menu
  setEditPage(site.editor, undefined)
}

export const undoRemovePage = (site: ISite, data: IRemovePageData) => {
  const { pageRoute, orderIndex, serializedPage, selectedComponentId } = data

  // Add back page and components
  const { pages, components } = deserializePages({ [pageRoute]: serializedPage })
  site.pages[pageRoute] = pages[pageRoute]
  Object.entries(components).forEach(([componentId, component]) => {
    site.context.components[componentId] = component
  })
  site.pageOrder.splice(orderIndex, 0, pageRoute)

  // Set active page and selected component back
  const prevSelectedComponent = site.context.components[selectedComponentId ?? '']
  setActivePage(site.editor, pageRoute)
  setSelectedComponent(site, prevSelectedComponent)
}
