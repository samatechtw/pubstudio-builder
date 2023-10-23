import {
  setActivePage,
  setSelectedComponent,
  triggerEditorEvent,
} from '@pubstudio/frontend/feature-editor'
import { createPage, createRootComponent } from '@pubstudio/frontend/util-build'
import { IAddPageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'
import { deleteComponentWithId } from '../component/add-component'

export const applyAddPage = (site: ISite, data: IAddPageData) => {
  const context = site.context
  const { metadata } = data
  const root = createRootComponent(context.namespace, context)

  // Add page
  site.pages[metadata.route] = createPage(metadata, root)
  context.components[root.id] = root

  // Set active page and selected component
  setActivePage(site.editor, metadata.route)
  setSelectedComponent(site.editor, undefined)

  // Add component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[root.id] = true
  }
  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
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

  // Set active page and selected component
  setActivePage(site.editor, activePageRoute)
  setSelectedComponent(site.editor, prevSelectedComponent)

  // Remove component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    delete componentTreeExpandedItems[rootId]
  }
  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)
}
