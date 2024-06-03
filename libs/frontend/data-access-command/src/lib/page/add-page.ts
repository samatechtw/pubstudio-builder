import { IAddPageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, IComponent, ISite } from '@pubstudio/shared/type-site'
import { addComponentHelper, deleteComponentWithId } from '../component/add-component'
import { createPage, createRootComponent } from '../create-util'
import { triggerEditorEvent } from '../editor-event-handlers'
import { setActivePage } from '../set-active-page'
import { setSelectedComponent } from '../set-selected-component'

export const applyAddPage = (site: ISite, data: IAddPageData) => {
  const context = site.context
  const { metadata, root } = data
  let pageRoot: IComponent
  if (root) {
    pageRoot = addComponentHelper(site, root)
  } else {
    pageRoot = createRootComponent(context.namespace, context)
  }

  // Add page
  site.pages[metadata.route] = createPage(metadata, pageRoot)
  context.components[pageRoot.id] = pageRoot

  // Add component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[pageRoot.id] = true
  }

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)

  // Set active page and selected component
  setActivePage(site.editor, metadata.route)
  setSelectedComponent(site, undefined)
}

export const undoAddPage = (site: ISite, data: IAddPageData) => {
  const context = site.context
  const { metadata, activePageRoute, selectedComponentId } = data
  const prevSelectedComponent = context.components[selectedComponentId ?? '']

  // Remove page and root component
  const rootId = site.pages[metadata.route].root.id
  delete site.pages[metadata.route]

  const deleteCount = deleteComponentWithId(site, rootId)
  context.nextId -= deleteCount

  // Remove component tree expand state
  const { componentTreeExpandedItems, componentsHidden } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    delete componentTreeExpandedItems[rootId]
  }
  if (componentsHidden) {
    delete componentsHidden[rootId]
  }

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)

  // Set active page and selected component
  setActivePage(site.editor, activePageRoute)
  setSelectedComponent(site, prevSelectedComponent)
}
