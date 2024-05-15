import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddReusableComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const addReusableComponentHelper = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { context, editor } = site
  if (editor) {
    data.componentIds.forEach((componentId) => {
      const component = resolveComponent(context, componentId)
      if (component) {
        editor.reusableComponentIds.add(component.id)
      }
    })
  }
}

export const applyAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  addReusableComponentHelper(site, data)
}

export const deleteReusableComponentWithIds = (
  site: ISite,
  reusableComponentIds: string[],
) => {
  const { context, editor } = site
  reusableComponentIds.forEach((componentId) => {
    const reusableCmp = resolveComponent(context, componentId)
    if (reusableCmp && editor) {
      editor.reusableComponentIds.delete(reusableCmp.id)
    }
  })
}

export const undoAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { componentIds } = data
  deleteReusableComponentWithIds(site, componentIds)
}
