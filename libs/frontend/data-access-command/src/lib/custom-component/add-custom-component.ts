import { iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddCustomComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const addCustomComponentHelper = (site: ISite, data: IAddCustomComponentData) => {
  const { context } = site
  const component = resolveComponent(context, data.componentId)
  if (component) {
    context.customComponentIds.add(component.id)
    iterateComponent(component.children, (child) => {
      context.customChildIds.add(child.id)
    })
  }
}

export const applyAddCustomComponent = (site: ISite, data: IAddCustomComponentData) => {
  addCustomComponentHelper(site, data)
}

export const deleteCustomComponentWithIds = (site: ISite, componentId: string) => {
  const { context } = site
  const component = resolveComponent(context, componentId)
  if (component) {
    context.customComponentIds.delete(component.id)
    iterateComponent(component.children, (child) => {
      context.customChildIds.delete(child.id)
    })
  }
}

export const undoAddCustomComponent = (site: ISite, data: IAddCustomComponentData) => {
  const { componentId } = data
  deleteCustomComponentWithIds(site, componentId)
}
