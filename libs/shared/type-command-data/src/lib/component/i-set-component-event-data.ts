import { IComponentEvent } from '@pubstudio/shared/type-site'

export interface ISetComponentEventData {
  componentId: string
  oldEvent?: IComponentEvent
  newEvent?: IComponentEvent
}
