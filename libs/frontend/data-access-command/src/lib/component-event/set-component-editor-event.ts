import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { ISetComponentEditorEventData } from '@pubstudio/shared/type-command-data'
import {
  EditorEventName,
  IComponent,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

const removeEvent = (
  component: IComponent | undefined,
  event: IEditorEvent | undefined,
) => {
  if (event && component && component.editorEvents) {
    delete component.editorEvents[event.name as EditorEventName]
  }
}

const addEvent = (component: IComponent | undefined, event: IEditorEvent) => {
  if (component) {
    if (!component.editorEvents) {
      component.editorEvents = {}
    }
    component.editorEvents[event.name as EditorEventName] = event
  }
}

const setEvents = (
  component: IComponent | undefined,
  oldEvent: IEditorEvent | undefined,
  newEvent: IEditorEvent | undefined,
) => {
  // Add or change
  if (newEvent !== undefined) {
    removeEvent(component, oldEvent)
    addEvent(component, newEvent)
  } else {
    // Remove event
    removeEvent(component, oldEvent)
  }
  if (
    component?.editorEvents &&
    Object.values(component?.editorEvents ?? []).length === 0
  ) {
    component.editorEvents = undefined
  }
}

export const applySetComponentEditorEvent = (
  site: ISite,
  data: ISetComponentEditorEventData,
) => {
  const { componentId, oldEvent, newEvent } = data
  const component = resolveComponent(site.context, componentId)
  setEvents(component, oldEvent, newEvent)
  // Select edited component for redo
  setSelectedComponent(site, component)
}

export const undoSetComponentEditorEvent = (
  site: ISite,
  data: ISetComponentEditorEventData,
) => {
  const { componentId, oldEvent, newEvent } = data
  const component = resolveComponent(site.context, componentId)
  setEvents(component, newEvent, oldEvent)
  // Select edited component for undo
  setSelectedComponent(site, component)
}
