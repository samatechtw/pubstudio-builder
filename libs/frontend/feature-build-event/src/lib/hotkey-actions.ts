import {
  setActivePage,
  setEditPage,
  setSelectedComponent,
  setStyleTab,
} from '@pubstudio/frontend/data-access-command'
import {
  addCustomComponentAtSelection,
  resetPageMenu,
} from '@pubstudio/frontend/feature-build'
import { useVueComponent } from '@pubstudio/frontend/feature-vue-component'
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
    setSelectedComponent(site, site.pages[page.route]?.root)
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

export const newVueComponent = () => {
  const { showVueComponentModal } = useVueComponent()
  showVueComponentModal.value = true
}
