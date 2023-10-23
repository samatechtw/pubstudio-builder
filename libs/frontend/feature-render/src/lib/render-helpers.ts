import { NativeEvents } from '@pubstudio/frontend/util-builtin'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IComponent, IEventCollection, ISite } from '@pubstudio/shared/type-site'

export const computeEvents = (site: ISite, component: IComponent): IEventCollection => {
  const events: IEventCollection = {
    native: {},
    custom: {},
  }

  for (const event of Object.values(component.events ?? {})) {
    const nativeEventName = NativeEvents[event.name]

    const eventHandler = (_e: Event | undefined) => {
      triggerEventBehaviors(event.behaviors, site, component)
    }

    if (nativeEventName) {
      events.native[nativeEventName] = eventHandler
    } else {
      events.custom[event.name] = [eventHandler, event.eventParams]
    }
  }
  return events
}
