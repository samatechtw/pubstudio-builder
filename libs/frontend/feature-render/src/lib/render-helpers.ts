import { NativeEvents, resolveComponent } from '@pubstudio/frontend/util-resolve'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IComponent, IEventCollection, ISite } from '@pubstudio/shared/type-site'

export const computeEvents = (site: ISite, component: IComponent): IEventCollection => {
  const events: IEventCollection = {
    native: {},
    custom: {},
  }
  const customCmp = resolveComponent(site.context, component.customSourceId)
  const allEvents = [
    ...Object.values(customCmp?.events ?? {}),
    ...Object.values(component.events ?? {}),
  ]

  for (const event of allEvents) {
    const nativeEventName = NativeEvents[event.name]

    const eventHandler = (e: Event | undefined) => {
      triggerEventBehaviors(event.behaviors, site, component, e)
    }

    const isNative =
      !!nativeEventName &&
      !(
        ['keyup', 'keydown'].includes(event.name) &&
        ['input', 'textarea'].includes(component.tag)
      )

    if (isNative) {
      events.native[nativeEventName] = eventHandler
    } else {
      events.custom[event.name] = [eventHandler, event.eventParams]
    }
  }
  return events
}

const i18nVarRegex = /\$\{(.*?)\}/g

export const parseI18n = (
  site: ISite,
  content: string | undefined,
): string | undefined => {
  if (!content) {
    return content
  }
  return content.replace(i18nVarRegex, (_, variable: string) => {
    const active = site.context.activeI18n ?? 'en'
    const val = (site.context.i18n[active] ?? {})[variable]
    return val ?? content
  })
}
