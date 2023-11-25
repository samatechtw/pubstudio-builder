import {
  registerComponentEditorEvents,
  removeEditorEvents,
  setSelectedComponent,
} from '@pubstudio/frontend/feature-editor'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { detachComponent } from '@pubstudio/frontend/util-component'
import { isDynamicComponent, nextComponentId } from '@pubstudio/frontend/util-ids'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const addComponentHelper = (site: ISite, data: IAddComponentData): IComponent => {
  const context = site.context
  const { name, tag, content, parentId, events, inputs, parentIndex, sourceId, style } =
    data
  const id = nextComponentId(context)
  data.id = id
  const parent = resolveComponent(context, parentId)
  let component: IComponent = {
    id,
    name: name ?? id,
    parent,
    tag,
    content,
    children: undefined,
    inputs,
    events,
    editorEvents: data.editorEvents,
    style: style ?? { custom: {} },
  }

  const sourceComponent = resolveComponent(context, sourceId)
  if (sourceComponent) {
    component = detachComponent(component, sourceComponent)
  }

  if (!parent) {
    // Pages have a root component by default
    // A Component without a parent is a template
  } else if (!parent.children) {
    parent.children = [component]
  } else if (parentIndex === undefined) {
    parent.children.push(component)
  } else {
    parent.children.splice(parentIndex, 0, component)
  }
  context.components[id] = component
  if (sourceComponent?.children) {
    for (const child of sourceComponent.children) {
      if (isDynamicComponent(child.id)) {
        console.log('Skip adding dynamic component', child.id)
      } else {
        addComponentHelper(site, {
          name: child.name,
          tag: child.tag,
          content: child.content,
          parentId: id,
          sourceId: child.id,
        })
      }
    }
  }

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
