import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { isDynamicComponent } from '@pubstudio/frontend/util-ids'
import { IAddReusableComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const addReusableComponentHelper = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { context, editor } = site
  const component = resolveComponent(context, data.componentId)

  if (editor && component && !isDynamicComponent(component.id)) {
    editor.reusableComponentIds.add(component.id)
    component.isReusable = true
  }
}

export const applyAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  addReusableComponentHelper(site, data)
}

export const deleteReusableComponentWithId = (
  site: ISite,
  reusableComponentId?: string,
) => {
  const { context, editor } = site
  const reusableCmp = resolveComponent(context, reusableComponentId)
  if (reusableCmp && editor) {
    editor.reusableComponentIds.delete(reusableCmp.id)
    reusableCmp.isReusable = undefined
  }
}

export const undoAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { componentId } = data
  deleteReusableComponentWithId(site, componentId)
}
