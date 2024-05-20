import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IChangePageData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

export const applyChangePage = (site: ISite, data: IChangePageData) => {
  const { to } = data
  const editor = site.editor
  if (editor) {
    editor.active = to
    setSelectedComponent(site, undefined)
  }
}

export const undoChangePage = (site: ISite, data: IChangePageData) => {
  const { from, selectedComponentId } = data
  const editor = site.editor
  if (editor) {
    editor.active = from
    const component = resolveComponent(site.context, selectedComponentId)
    setSelectedComponent(site, component)
  }
}
