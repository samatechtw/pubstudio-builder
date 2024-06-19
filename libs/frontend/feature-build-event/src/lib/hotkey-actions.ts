import {
  setActivePage,
  setEditPage,
  setStyleTab,
} from '@pubstudio/frontend/data-access-command'
import {
  addCustomComponentAtSelection,
  resetPageMenu,
} from '@pubstudio/frontend/feature-build'
import { getOrderedPages } from '@pubstudio/frontend/util-builder'
import { ISite, StyleTab } from '@pubstudio/shared/type-site'

export const addCustomComponentAtIndex = (site: ISite, index: number) => {
  const customId = Array.from(site.context.customComponentIds)[index]
  if (customId) {
    addCustomComponentAtSelection(site, customId)
  }
}

export const setPageByIndex = (site: ISite, index: number) => {
  const page = getOrderedPages(site)[index]
  if (page) {
    setActivePage(site.editor, page.route)
    resetPageMenu()
    setEditPage(site.editor, page.route)
  }
}

export const toggleStyleEdit = (site: ISite) => {
  const tabs = Object.values(StyleTab)
  const currentTab = site.editor?.styleTab
  const newIndex = currentTab ? tabs.indexOf(currentTab) : -1
  setStyleTab(site.editor, tabs[(newIndex + 1) % tabs.length])
}
