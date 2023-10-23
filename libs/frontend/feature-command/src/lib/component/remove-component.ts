import {
  registerComponentEditorEvents,
  removeEditorEvents,
} from '@pubstudio/frontend/feature-editor'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IRemoveComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const applyRemoveComponent = (site: ISite, data: IRemoveComponentData) => {
  const context = site.context
  const { id } = data
  const component = resolveComponent(context, id)
  if (component) {
    // Remove children first
    if (data.children) {
      for (const child of data.children) {
        applyRemoveComponent(site, child)
      }
    }
    delete context.components[component.id]

    // Remove parent
    const parent = component.parent
    if (parent) {
      parent.children = parent.children?.filter((c) => c.id !== id)
      if (parent.children?.length === 0) {
        parent.children = undefined
      }
    }

    // Remove component tree expand state
    const { componentTreeExpandedItems } = site.editor ?? {}
    if (componentTreeExpandedItems) {
      delete componentTreeExpandedItems[component.id]
    }

    // Clear editor events
    removeEditorEvents(site, component)
  }
}

// We can almost reuse `applyAddComponent`, but we don't want to generate a new ID
// and we need to recover the children
export const undoRemoveComponent = (site: ISite, data: IRemoveComponentData) => {
  const context = site.context
  const {
    id,
    name,
    tag,
    content,
    parentId,
    style,
    inputs,
    events,
    parentIndex,
    editorEvents,
  } = data
  const parent = resolveComponent(context, parentId)
  const component: IComponent = {
    id,
    name: name ?? id,
    tag: tag ?? 'div',
    parent,
    content,
    children: undefined,
    style: style ?? { custom: {} },
    inputs,
    events,
  }

  if (!parent) {
    // Pages have a root component by default
    // A Component without a parent is a template
  } else if (!parent?.children) {
    parent.children = [component]
  } else {
    parent.children.splice(parentIndex, 0, component)
  }
  // Add the component to Context first so children can resolve us
  context.components[id] = component
  data.children?.forEach((c) => undoRemoveComponent(site, c))

  // Add back component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[component.id] = true
  }

  // Register editor events
  if (editorEvents) {
    registerComponentEditorEvents(site, component, editorEvents)
    if (editorEvents.OnSelfAdded) {
      triggerEventBehaviors(editorEvents.OnSelfAdded.behaviors, site, component)
    }
  }
}
