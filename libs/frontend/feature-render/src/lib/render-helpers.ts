import { NativeEvents, resolveComponent } from '@pubstudio/frontend/util-resolve'
import { triggerEventBehaviors } from '@pubstudio/frontend/util-runtime'
import {
  IComponent,
  IEventCollection,
  ISite,
  ITranslations,
} from '@pubstudio/shared/type-site'

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

export const i18nVarRegex = /\$\{(.*?)\}/g

export const parseI18n = (
  i18n: Record<string, ITranslations>,
  lang: string,
  content: string | undefined,
): string | undefined => {
  if (!content) {
    return content
  }
  return content.replace(i18nVarRegex, (_, variable: string) => {
    const val = i18n[lang]?.[variable] || i18n['en']?.[variable]
    return val ?? content
  })
}
