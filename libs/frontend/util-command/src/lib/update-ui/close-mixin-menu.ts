import { ICloseMixinMenuParams } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { editStylesCancelEdit, setEditingMixin } from '../edit-styles-data'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { setSelectedComponent } from '../set-selected-component'

export const applyCloseMixinMenu = (site: ISite, params: ICloseMixinMenuParams) => {
  editStylesCancelEdit(site)

  const { originComponentId } = params
  if (originComponentId) {
    const component = resolveComponent(site.context, originComponentId)
    setSelectedComponent(site, component)
  }
}

export const undoCloseMixinMenu = (site: ISite, params: ICloseMixinMenuParams) => {
  // Re-open edit mixin
  setEditingMixin(site, params.mixinId, params.originComponentId)
}
