import { NativeEvents, resolveComponent } from '@pubstudio/frontend/util-resolve'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import { IComponent, IEventCollection, ISite } from '@pubstudio/shared/type-site'

export const computeEvents = (site: ISite, component: IComponent): IEventCollection => {
  const events: IEventCollection = {
    native: {},
    custom: {},
  }

  const appendEvents = (cmp: IComponent) => {
    for (const event of Object.values(cmp.events ?? {})) {
      const nativeEventName = NativeEvents[event.name]

      const eventHandler = (e: Event | undefined) => {
        triggerEventBehaviors(event.behaviors, site, component, e)
      }

      if (nativeEventName) {
        events.native[nativeEventName] = eventHandler
      } else {
        events.custom[event.name] = [eventHandler, event.eventParams]
      }
    }
  }

  const reusableCmp = resolveComponent(site.context, component.reusableSourceId)

  // Append reusable source events
  if (reusableCmp) {
    appendEvents(reusableCmp)
  }

  // Append component events
  appendEvents(component)

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
    return val ?? variable
  })
}
