import { IOpenMixinMenuParams } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { editStylesCancelEdit, setEditingMixin } from '../edit-styles-data'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { setSelectedComponent } from '../set-selected-component'

export const applyOpenMixinMenu = (site: ISite, params: IOpenMixinMenuParams) => {
  setEditingMixin(site, params.mixinId, params.originComponentId)
}

export const undoOpenMixinMenu = (site: ISite, params: IOpenMixinMenuParams) => {
  editStylesCancelEdit(site)

  const { originComponentId } = params
  if (originComponentId) {
    const component = resolveComponent(site.context, originComponentId)
    setSelectedComponent(site, component)
  }
}
