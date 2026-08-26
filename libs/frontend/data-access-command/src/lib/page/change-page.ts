import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IChangePageData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { exitComponentEdit } from '../custom-component/component-arena'
import { setSelectedComponent } from '../set-selected-component'

export const applyChangePage = (site: ISite, data: IChangePageData) => {
  const { to } = data
  const editor = site.editor
  if (editor) {
    // The component edit screen replaces the canvas, so leaving a page leaves it too
    exitComponentEdit(site)
    editor.active = to
    setSelectedComponent(site, undefined)
  }
}

export const undoChangePage = (site: ISite, data: IChangePageData) => {
  const { from, selectedComponentId } = data
  const editor = site.editor
  if (editor) {
    exitComponentEdit(site)
    editor.active = from
    const component = resolveComponent(site.context, selectedComponentId)
    setSelectedComponent(site, component)
  }
}
