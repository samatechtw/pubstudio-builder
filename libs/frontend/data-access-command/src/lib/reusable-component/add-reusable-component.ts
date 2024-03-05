import {
  resolveComponent,
  resolveReusableComponent,
} from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { isDynamicComponent, nextReusableComponentId } from '@pubstudio/frontend/util-ids'
import { IAddReusableComponentData } from '@pubstudio/shared/type-command-data'
import { IReusableComponent, ISite } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

export const addReusableComponentHelper = (
  site: ISite,
  data: IAddReusableComponentData,
): IReusableComponent => {
  const context = site.context
  const { name, tag, content, parentId, sourceId, style, events, inputs } = data
  const id = nextReusableComponentId(context)
  data.id = id

  const reusableCmp: IReusableComponent = {
    id,
    name: name ?? id,
    tag,
    content,
    parentId,
    style: clone(style),
    inputs: clone(inputs),
    events: clone(events),
    editorEvents: clone(data.editorEvents),
  }

  const parent = resolveReusableComponent(context, parentId)
  if (parent) {
    if (!parent.children) {
      parent.children = [reusableCmp]
    } else {
      parent.children.push(reusableCmp)
    }
  }

  if (!context.reusableComponents) {
    context.reusableComponents = {}
  }
  context.reusableComponents[id] = reusableCmp

  const sourceComponent = resolveComponent(context, sourceId)
  if (sourceComponent?.children) {
    for (const child of sourceComponent.children) {
      if (isDynamicComponent(child.id)) {
        console.log('Skip adding dynamic component', child.id)
      } else {
        addReusableComponentHelper(site, {
          name: child.name,
          tag: child.tag,
          content: child.content,
          parentId: id,
          style: child.style,
          inputs: child.inputs,
          events: child.events,
          editorEvents: child.editorEvents,
        })
      }
    }
  }

  // TODO: change all cmpIds in `reusableCmp.style.overrides` to reusableCmp ids.

  return reusableCmp
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
): number => {
  const { context } = site
  const reusableCmp = resolveReusableComponent(context, reusableComponentId)
  // Track total number of deleted reusable components to help reset `context.nextId`
  // When a component with children are added, the latest ID will correspond to the last child.
  // If we modify `nextId` here, we can't resolve the child later
  let deleteCount = 0
  if (reusableCmp) {
    delete context.reusableComponents[reusableCmp.id]
    deleteCount = 1
    if (reusableCmp.children) {
      for (const child of reusableCmp.children) {
        deleteCount += deleteReusableComponentWithId(site, child.id)
      }
    }
  }
  return deleteCount
}

export const undoAddReusableComponent = (
  site: ISite,
  data: IAddReusableComponentData,
) => {
  const context = site.context
  const { id, selectedComponentId } = data
  const deleteCount = deleteReusableComponentWithId(site, id)
  context.nextId -= deleteCount

  if (selectedComponentId) {
    const selectedComponent = context.components[selectedComponentId]
    if (selectedComponent) {
      setSelectedComponent(site, selectedComponent)
    }
  }
}
