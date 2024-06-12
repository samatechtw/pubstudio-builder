import {
  ISetComponentEditorEventData,
  ISetComponentEventData,
} from '@pubstudio/shared/type-command-data'
import {
  EditorEventName,
  IComponent,
  IComponentEvent,
  IEditorEvent,
} from '@pubstudio/shared/type-site'

export const addComponentEventData = (
  component: IComponent,
  newEvent: IComponentEvent,
): ISetComponentEventData => {
  const oldEvent = component.events?.[newEvent.name]
  const data: ISetComponentEventData = {
    componentId: component.id,
    oldEvent,
    newEvent,
  }
  return data
}

export const addComponentEditorEventData = (
  component: IComponent,
  newEvent: IEditorEvent,
): ISetComponentEventData => {
  const oldEvent = component.editorEvents?.[newEvent.name as EditorEventName]
  const data: ISetComponentEditorEventData = {
    componentId: component.id,
    oldEvent,
    newEvent,
  }
  return data
}
