import { noBehaviorId, toggleHiddenId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { ISetComponentEventData } from '@pubstudio/shared/type-command-data'
import {
  ComponentEventType,
  IComponent,
  IComponentEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applySetComponentEvent, undoSetComponentEvent } from './set-component-event'

describe('Set Component Event', () => {
  let siteString: string
  let site: ISite
  let component: IComponent
  let event: IComponentEvent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    const serialized = mockSerializedComponent(site)
    event = {
      name: ComponentEventType.Click,
      behaviors: [
        {
          behaviorId: toggleHiddenId,
        },
      ],
    }
    applyAddComponent(site, mockAddComponentData(serialized))
    component = resolveComponent(site.context, serialized.id) as IComponent
  })

  it('should add component event and undo', () => {
    // Assert no events in component
    expect(component.events).toBe(undefined)

    // Set component event
    const data: ISetComponentEventData = {
      componentId: component.id,
      newEvent: event,
    }
    applySetComponentEvent(site, data)
    // Assert event is added
    expect(component.events?.[event.name]).toEqual(event)

    undoSetComponentEvent(site, data)
    // Assert new event is removed
    expect(component.events).toBe(undefined)
  })

  it('should remove component event', () => {
    // Set up component with event
    const serialized = mockSerializedComponent(site, { events: { [event.name]: event } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    // Set component event and undo
    const data: ISetComponentEventData = {
      componentId: component.id,
      oldEvent: event,
    }
    applySetComponentEvent(site, data)
    // Assert event is removed
    expect(component.events).toBe(undefined)

    undoSetComponentEvent(site, data)
    // Assert event added again
    expect(component.events?.[event.name]).toEqual(event)
  })

  it('should update component event', () => {
    // Set up component with event
    const serialized = mockSerializedComponent(site, { events: { [event.name]: event } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    const newEvent: IComponentEvent = {
      ...event,
      name: 'hover',
      behaviors: [
        {
          behaviorId: noBehaviorId,
        },
      ],
    }
    const data: ISetComponentEventData = {
      componentId: component.id,
      oldEvent: event,
      newEvent,
    }
    applySetComponentEvent(site, data)
    // Assert event is updated
    expect(component.events?.[newEvent.name]).toEqual(newEvent)
    expect(component.events?.[event.name]).toBeUndefined()

    undoSetComponentEvent(site, data)
    // Assert event is reverted
    expect(component.events?.[newEvent.name]).toBeUndefined()
    expect(component.events?.[event.name]).toEqual(event)
  })

  it('should add and remove event arg', () => {
    const newEvent: IComponentEvent = {
      ...event,
      behaviors: [
        {
          ...event.behaviors[0],
          args: { id: 'test-c-1' },
        },
      ],
    }
    const data: ISetComponentEventData = {
      componentId: component.id,
      oldEvent: event,
      newEvent,
    }
    applySetComponentEvent(site, data)
    // Assert event with args is added
    expect(component.events?.[newEvent.name]?.behaviors[0]?.args?.id).toEqual('test-c-1')

    // Remove arg by replacing the event with the original version
    applySetComponentEvent(site, {
      componentId: component.id,
      oldEvent: newEvent,
      newEvent: event,
    })
    // Assert arg is removed
    expect(component.events?.[newEvent.name]?.behaviors[0].args).toBeUndefined()
  })
})
