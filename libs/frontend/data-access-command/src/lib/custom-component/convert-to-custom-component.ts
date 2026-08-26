import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IConvertToCustomComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { addComponentHelper, deleteComponentWithId } from '../component/add-component'
import { setSelectedComponent } from '../set-selected-component'
import {
  exitComponentEdit,
  removeStoredArena,
  restoreStoredArena,
} from './component-arena'

// Leaves an instance behind, so the page renders exactly as it did before
export const applyConvertToCustomComponent = (
  site: ISite,
  data: IConvertToCustomComponentData,
) => {
  const { context } = site
  const component = resolveComponent(context, data.componentId)
  const parent = resolveComponent(context, data.parentId)
  if (!component || !parent) {
    return
  }
  parent.children = parent.children?.filter((c) => c.id !== component.id)
  if (!parent.children?.length) {
    parent.children = undefined
  }
  component.parent = undefined
  context.customComponentIds.add(component.id)
  restoreStoredArena(site, data.componentId, data.arena)

  const instance = addComponentHelper(site, {
    name: component.name,
    tag: component.tag,
    parentId: data.parentId,
    parentIndex: data.parentIndex,
    customComponentId: component.id,
  })
  data.instanceId = instance.id
  setSelectedComponent(site, instance)
}

export const undoConvertToCustomComponent = (
  site: ISite,
  data: IConvertToCustomComponentData,
) => {
  const { context } = site
  if (site.editor?.editingComponentId === data.componentId) {
    exitComponentEdit(site)
  }
  data.arena = removeStoredArena(site, data.componentId) ?? data.arena
  context.nextId -= deleteComponentWithId(site, data.instanceId, {})
  context.customComponentIds.delete(data.componentId)

  const component = context.components[data.componentId]
  const parent = resolveComponent(context, data.parentId)
  if (component && parent) {
    component.parent = parent
    if (parent.children) {
      parent.children.splice(data.parentIndex, 0, component)
    } else {
      parent.children = [component]
    }
  }
  setSelectedComponent(site, component)
}
