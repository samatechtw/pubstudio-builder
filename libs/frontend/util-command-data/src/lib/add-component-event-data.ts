import { ISetComponentEventData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentEvent } from '@pubstudio/shared/type-site'

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
