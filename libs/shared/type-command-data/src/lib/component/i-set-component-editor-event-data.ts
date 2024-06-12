import { IEditorEvent } from '@pubstudio/shared/type-site'

export interface ISetComponentEditorEventData {
  componentId: string
  oldEvent?: IEditorEvent
  newEvent?: IEditorEvent
}
