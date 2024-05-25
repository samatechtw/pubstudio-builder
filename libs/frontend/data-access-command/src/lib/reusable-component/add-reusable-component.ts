import { iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddReusableComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const addReusableComponentHelper = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { context } = site
  const component = resolveComponent(context, data.componentId)
  if (component) {
    context.reusableComponentIds.add(component.id)
    iterateComponent(component.children, (child) => {
      context.reusableChildIds.add(child.id)
    })
  }
}

export const applyAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  addReusableComponentHelper(site, data)
}

export const deleteReusableComponentWithIds = (site: ISite, componentId: string) => {
  const { context } = site
  const component = resolveComponent(context, componentId)
  if (component) {
    context.reusableComponentIds.delete(component.id)
    iterateComponent(component.children, (child) => {
      context.reusableChildIds.delete(child.id)
    })
  }
}

export const undoAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const { componentId } = data
  deleteReusableComponentWithIds(site, componentId)
}
