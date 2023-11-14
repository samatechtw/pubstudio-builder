import {
  setActivePage,
  setSelectedComponent,
  triggerEditorEvent,
} from '@pubstudio/frontend/feature-editor'
import { useLocalStore, useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { deserializePages } from '@pubstudio/frontend/util-site-deserialize'
import { IRemovePageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, ISite } from '@pubstudio/shared/type-site'

export const applyRemovePage = (site: ISite, data: IRemovePageData) => {
  const { pageRoute } = data
  const pageRoutes = Object.keys(site.pages)
  // Make sure we don't delete the only page in the site
  if (pageRoutes.length < 2) {
    throw new Error('Cannot remove page when page count is less than 2')
  }

  // Remove page
  delete site.pages[pageRoute]

  // Serialize and deserialize site to clean up everything
  const { siteStore } = useSiteSource()
  siteStore.value.save(site)
  const { restore } = useLocalStore()
  // Deserialize from localstorage to avoid a long API call
  restore()

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)

  // Set active page to another one
  const nextActivePageRoute = pageRoutes.find((route) => route !== pageRoute) as string
  setActivePage(site.editor, nextActivePageRoute)
  setSelectedComponent(site, undefined)
}

export const undoRemovePage = (site: ISite, data: IRemovePageData) => {
  const { pageRoute, serializedPage, selectedComponentId } = data

  // Add back page and components
  const { pages, components } = deserializePages({ [pageRoute]: serializedPage })
  site.pages[pageRoute] = pages[pageRoute]
  Object.entries(components).forEach(([componentId, component]) => {
    site.context.components[componentId] = component
  })

  // Trigger page change event
  triggerEditorEvent(site, EditorEventName.OnPageChange)

  // Set active page and selected component back
  const prevSelectedComponent = site.context.components[selectedComponentId ?? '']
  setActivePage(site.editor, pageRoute)
  setSelectedComponent(site, prevSelectedComponent)
}
