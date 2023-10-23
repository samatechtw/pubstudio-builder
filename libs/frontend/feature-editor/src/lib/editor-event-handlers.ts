import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import {
  EditorEventName,
  IComponent,
  IComponentEditorEvents,
  IComponentEventBehavior,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'

// Register all of a component's editor events
export const registerComponentEditorEvents = (
  site: ISite,
  component: IComponent,
  events: IComponentEditorEvents,
) => {
  for (const [name, editorEvent] of Object.entries(events)) {
    const eventName = name as EditorEventName
    registerEditorEvent(site, component, eventName, editorEvent.behaviors)
  }
}

// Register a component's editor event
export const registerEditorEvent = (
  site: ISite,
  component: IComponent,
  eventName: EditorEventName,
  behaviors: IComponentEventBehavior[],
) => {
  const { editor } = site
  if (editor) {
    if (!editor.editorEvents[eventName]) {
      editor.editorEvents[component.id] = {}
    }
    const event: IEditorEvent = { name: eventName, behaviors }
    editor.editorEvents[component.id][eventName] = event
  }
}

// Remove editor events for a Component
export const removeEditorEvents = (site: ISite, component: IComponent) => {
  if (site.editor) {
    delete site.editor.editorEvents[component.id]
  }
}

// Trigger an editor event for all registered components
export const triggerEditorEvent = (site: ISite, eventName: EditorEventName) => {
  const { editor } = site
  if (editor) {
    for (const componentId in editor.editorEvents) {
      const eventMap = editor.editorEvents[componentId]
      const componentBehaviors = eventMap[eventName]?.behaviors
      if (componentBehaviors) {
        const component = resolveComponent(site.context, componentId)
        if (component) {
          triggerEventBehaviors(componentBehaviors, site, component)
        }
      }
    }
  }
}
