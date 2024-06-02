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
import { setSelectedComponent } from '../set-selected-component'

const addChildrenHelper = (
  site: ISite,
  parentId: string,
  children: IComponent[],
  sourceField: 'sourceId' | 'reusableComponentId',
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
        reusableComponentId: child.id,
      })
    }
  }
}

export const addComponentHelper = (site: ISite, data: IAddComponentData): IComponent => {
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
    reusableComponentId,
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
  const reusableCmp = resolveComponent(context, reusableComponentId)

  if (sourceComponent) {
    component = detachComponent(component, sourceComponent)
  } else if (reusableCmp) {
    component = {
      id,
      name: component.name,
      parent: component.parent,
      tag: component.tag,
      content: undefined,
      children: component.children,
      // Only overridden inputs will be added to a reusable instance.
      inputs: undefined,
      // Only overridden events will be added to a reusable instance.
      events: undefined,
      // Initial state copied to instance
      state: clone(reusableCmp.state),
      editorEvents: clone(reusableCmp.editorEvents),
      style: { custom: {} },
    }
  }
  // Allow both sourceId and reusableComponentId for copy/paste of reusable instances
  component.reusableSourceId = reusableComponentId

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
        style: clone(child.style),
      })
    }
  } else if (sourceComponent?.children) {
    addChildrenHelper(site, id, sourceComponent.children, 'sourceId')
  } else if (reusableCmp?.children) {
    addChildrenHelper(site, id, reusableCmp.children, 'reusableComponentId')
  }

  // Update `parent.children` after `addChildrenHelper` to avoid infinite loop
  // when a reusable component is inserted as a instance of itself.
  if (parent) {
    parent.children = parentNewChildren
  }

  // Copy override styles and assign them to new children where possible
  component.style.overrides = detachOverrides(component, sourceComponent)

  // Add component tree expand state
  const { componentTreeExpandedItems } = site.editor ?? {}
  if (componentTreeExpandedItems) {
    componentTreeExpandedItems[id] = true
  }
  // Register editor events
  const editorEvents = component.editorEvents
  if (editorEvents) {
    registerComponentEditorEvents(site, component, editorEvents)
    if (editorEvents.OnSelfAdded) {
      triggerEventBehaviors(editorEvents.OnSelfAdded.behaviors, site, component)
    }
  }
  return component
}

export const applyAddComponent = (site: ISite, data: IAddComponentData) => {
  const component = addComponentHelper(site, data)

  // Select created component
  // Split helper function to enable creating components without a page
  setSelectedComponent(site, component)
}

export const deleteComponentWithId = (site: ISite, componentId?: string): number => {
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
        deleteCount += deleteComponentWithId(site, child.id)
      }
    }
    // Clear editor events
    removeEditorEvents(site, component)

    // Delete component tree expand state
    const { componentTreeExpandedItems } = editor ?? {}
    if (componentTreeExpandedItems) {
      delete componentTreeExpandedItems[component.id]
    }
  }
  return deleteCount
}

export const undoAddComponent = (site: ISite, data: IAddComponentData) => {
  const context = site.context
  const { id, selectedComponentId } = data
  const deleteCount = deleteComponentWithId(site, id)
  context.nextId -= deleteCount

  if (selectedComponentId) {
    const selectedComponent = context.components[selectedComponentId]
    if (selectedComponent) {
      setSelectedComponent(site, selectedComponent)
    }
  }
}
