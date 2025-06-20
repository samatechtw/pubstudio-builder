import {
  clone,
  detachComponent,
  detachOverrides,
} from '@pubstudio/frontend/util-component'
import { nextComponentId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import {
  registerComponentEditorEvents,
  removeEditorEvents,
} from '../editor-event-handlers'
import { toggleComponentTreeHidden } from '../editor-helpers'
import { setSelectedComponent } from '../set-selected-component'

const addChildrenHelper = (
  site: ISite,
  parentId: string,
  children: IComponent[],
  sourceField: 'sourceId' | 'customComponentId',
) => {
  for (const child of children) {
    if (sourceField === 'sourceId') {
      addComponentHelper(site, {
        name: child.name,
        tag: child.tag,
        content: child.content,
        parentId,
        [sourceField]: child.id,
        state: clone(child.state),
        inputs: clone(child.inputs),
        style: clone(child.style),
      })
    } else {
      addComponentHelper(site, {
        name: child.name,
        tag: child.tag,
        parentId,
        customComponentId: child.id,
      })
    }
  }
}

export const addComponentHelper = (
  site: ISite,
  data: IAddComponentData,
  isRedo?: boolean,
): IComponent => {
  const context = site.context
  const {
    name,
    tag,
    content,
    state,
    parentId,
    events,
    inputs,
    parentIndex,
    customComponentId,
    sourceId,
    style,
  } = data
  const id = nextComponentId(context)
  data.id = id
  const parent = resolveComponent(context, parentId)
  let component: IComponent = {
    id,
    name: name ?? id,
    parent,
    tag,
    content,
    state,
    children: undefined,
    inputs,
    events,
    editorEvents: data.editorEvents,
    style: style ?? { custom: {} },
  }

  const sourceComponent = resolveComponent(context, sourceId)
  const customCmp = resolveComponent(context, customComponentId)

  if (sourceComponent) {
    component = detachComponent(component, sourceComponent)
  } else if (customCmp) {
    component = {
      id,
      name: component.name,
      parent: component.parent,
      tag: component.tag,
      content: undefined,
      children: component.children,
      // Only overridden inputs will be added to a custom instance.
      inputs: undefined,
      // Only overridden events will be added to a custom instance.
      events: undefined,
      // Initial state copied to instance
      state: clone(customCmp.state),
      editorEvents: clone(customCmp.editorEvents),
      style: { custom: {} },
    }
  }
  // Allow both sourceId and customComponentId for copy/paste of custom instances
  component.customSourceId = customComponentId

  let parentNewChildren = parent?.children ? [...parent.children] : undefined

  if (!parent) {
    // Pages have a root component by default
    // A Component without a parent is a template
  } else if (!parent.children) {
    parentNewChildren = [component]
  } else if (parentIndex === undefined) {
    parentNewChildren?.push(component)
  } else {
    parentNewChildren?.splice(parentIndex, 0, component)
  }

  context.components[id] = component
  // Children overridden in builtin component definition take precedence
  if (data.children) {
    for (const child of data.children) {
      addComponentHelper(site, {
        name: child.name,
        tag: child.tag,
        content: child.content,
        parentId: id,
        sourceId: child.id,
        state: child.state,
        children: child.children,
        inputs: clone(child.inputs),
        events: clone(child.events),
        editorEvents: clone(child.editorEvents),
        style: clone(child.style),
      })
    }
  } else if (sourceComponent?.children) {
    addChildrenHelper(site, id, sourceComponent.children, 'sourceId')
  } else if (customCmp?.children) {
    addChildrenHelper(site, id, customCmp.children, 'customComponentId')
  }

  // Update `parent.children` after `addChildrenHelper` to avoid infinite loop
  // when a custom component is inserted as a instance of itself.
  if (parent) {
    parent.children = parentNewChildren
  }

  // Copy override styles and assign them to new children where possible
  component.style.overrides = detachOverrides(component, sourceComponent)

  // Add component tree expand state
  const { componentTreeExpandedItems, componentsHidden } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[id] = true
  }
  // If the source was hidden, hide the new component
  if (componentsHidden && sourceId) {
    componentsHidden[id] = componentsHidden[sourceId]
  }
  // Register editor events
  const editorEvents = component.editorEvents
  registerComponentEditorEvents(site, component)
  if (!isRedo && editorEvents?.OnSelfAdded) {
    triggerEventBehaviors(editorEvents.OnSelfAdded.behaviors, site, component)
  }
  return component
}

export const applyAddComponent = (
  site: ISite,
  data: IAddComponentData,
  isRedo?: boolean,
) => {
  const component = addComponentHelper(site, data, isRedo)

  if (data.hidden) {
    for (const [id, hide] of Object.entries(data.hidden)) {
      toggleComponentTreeHidden(site, id, hide)
    }
  }

  // Select created component
  // Split helper function to enable creating components without a page
  setSelectedComponent(site, component)
}

export const deleteComponentWithId = (
  site: ISite,
  componentId: string | undefined,
  hidden: Record<string, boolean>,
): number => {
  const { editor, context } = site
  const component = resolveComponent(context, componentId)
  // Track total number of deleted components to help reset `context.nextId`
  // When a component with children are added, the latest ID will correspond to the last child.
  // If we modify `nextId` here, we can't resolve the child later
  let deleteCount = 0
  if (component) {
    delete context.components[component.id]
    deleteCount = 1
    const parent = component.parent
    if (editor && editor.selectedComponent?.id === componentId) {
      editor.selectedComponent = parent
    }
    if (parent) {
      parent.children = parent.children?.filter((c) => c.id !== componentId)
      if (parent.children?.length === 0) {
        parent.children = undefined
      }
    }
    if (component.children) {
      for (const child of component.children) {
        deleteCount += deleteComponentWithId(site, child.id, hidden)
      }
    }
    // Clear editor events
    removeEditorEvents(site, component)

    // Delete component tree expand state
    const { componentTreeExpandedItems, componentsHidden } = editor ?? {}
    if (componentTreeExpandedItems) {
      delete componentTreeExpandedItems[component.id]
    }
    if (componentsHidden) {
      if (componentsHidden[component.id] !== undefined) {
        hidden[component.id] = componentsHidden[component.id]
      }
      delete componentsHidden[component.id]
    }
  }
  return deleteCount
}

export const undoAddComponent = (site: ISite, data: IAddComponentData) => {
  const context = site.context
  const { id, selectedComponentId } = data
  const hidden = {}
  const deleteCount = deleteComponentWithId(site, id, hidden)
  if (Object.keys(hidden).length) {
    data.hidden = hidden
  }
  context.nextId -= deleteCount

  if (selectedComponentId) {
    const selectedComponent = context.components[selectedComponentId]
    if (selectedComponent) {
      setSelectedComponent(site, selectedComponent)
    }
  }
}
