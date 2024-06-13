import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IRemoveComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import {
  registerComponentEditorEvents,
  removeEditorEvents,
} from '../editor-event-handlers'
import { setSelectedComponent } from '../set-selected-component'

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

    // Remove component tree hide and expand state
    const { componentTreeExpandedItems, componentsHidden } = site.editor ?? {}
    if (componentTreeExpandedItems) {
      delete componentTreeExpandedItems[component.id]
    }
    if (componentsHidden) {
      delete componentsHidden[component.id]
    }

    // Clear editor events
    removeEditorEvents(site, component)

    // Clear selected component state after delete
    setSelectedComponent(site, undefined)
  }
}

// We can almost reuse `applyAddComponent`, but we don't want to generate a new ID
// and we need to recover the children.
export const undoRemoveComponent = (site: ISite, data: IRemoveComponentData) => {
  undoRemoveComponentHelper(site, data, true)
}

// Declare a new function so that we don't have to add additional arguments to `undoRemoveComponent`.
export const undoRemoveComponentHelper = (
  site: ISite,
  data: IRemoveComponentData,
  selectAfterUndo: boolean,
) => {
  const context = site.context
  const {
    id,
    name,
    tag,
    content,
    parentId,
    reusableComponentId,
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
    reusableSourceId: reusableComponentId,
    style: style ?? { custom: {} },
    inputs,
    events,
    editorEvents,
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
  data.children?.forEach((c) => undoRemoveComponentHelper(site, c, selectAfterUndo))

  // Add back component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[component.id] = true
  }

  // Register editor events
  registerComponentEditorEvents(site, component)
  if (editorEvents?.OnSelfAdded) {
    triggerEventBehaviors(editorEvents.OnSelfAdded.behaviors, site, component)
  }

  if (selectAfterUndo) {
    // Select deleted component after undo
    setSelectedComponent(site, component)
  }
}
