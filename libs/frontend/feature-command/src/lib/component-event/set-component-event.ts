import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { ISetComponentEventData } from '@pubstudio/shared/type-command-data'
import {
  ComponentEventType,
  IComponent,
  IComponentEvent,
  ISite,
} from '@pubstudio/shared/type-site'

const removeEvent = (
  component: IComponent | undefined,
  event: IComponentEvent | undefined,
) => {
  if (event && component && component.events) {
    delete component.events[event.name]
  }
}

const addEvent = (component: IComponent | undefined, event: IComponentEvent) => {
  if (component) {
    if (!component.events) {
      component.events = {}
    }
    component.events[event.name] = event
  }
}

const setEvents = (
  site: ISite,
  component: IComponent | undefined,
  oldEvent: IComponentEvent | undefined,
  newEvent: IComponentEvent | undefined,
) => {
  // Add or change
  if (newEvent !== undefined) {
    removeEvent(component, oldEvent)
    addEvent(component, newEvent)
  } else {
    // Remove event
    removeEvent(component, oldEvent)
  }
  if (component?.events && Object.values(component?.events ?? []).length === 0) {
    component.events = undefined
  }
  if (component) {
    if (newEvent?.name === ComponentEventType.OnAppear) {
      // TODO -- A hack to make sure dynamic behavior (like adding components) is triggered
      // when the event changes. Is there a better way to do this?
      triggerEventBehaviors(newEvent.behaviors, site, component)
    }
  }
}

export const applySetComponentEvent = (site: ISite, data: ISetComponentEventData) => {
  const { componentId, oldEvent, newEvent } = data
  const component = resolveComponent(site.context, componentId)
  setEvents(site, component, oldEvent, newEvent)
}

export const undoSetComponentEvent = (site: ISite, data: ISetComponentEventData) => {
  const { componentId, oldEvent, newEvent } = data
  const component = resolveComponent(site.context, componentId)
  setEvents(site, component, newEvent, oldEvent)
}
