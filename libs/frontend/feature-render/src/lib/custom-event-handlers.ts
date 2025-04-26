import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { registerScroll, runtimeContext } from '@pubstudio/frontend/util-runtime'
import {
  EventHandler,
  IComponent,
  ICustomEvents,
  ISite,
} from '@pubstudio/shared/type-site'
// import { createClickawayListener } from '@samatech/vue-components'
import { ClickawayCallback } from '@samatech/vue-components'
import { computeEvents } from './render-helpers'

const toInt = (thing: string | undefined, fallback: number): number => {
  if (thing === undefined) {
    return fallback
  }
  return parseInt(thing)
}

const createClickawayListener = (
  site: ISite,
  ignoreId: string,
  callback: ClickawayCallback,
): EventHandler => {
  return (event: Event | undefined) => {
    const eventEl = event?.target as Element | undefined
    let cmp = resolveComponent(site.context, eventEl?.id)
    while (cmp) {
      if (cmp.id === ignoreId) {
        return
      }
      cmp = cmp.parent
    }
    return callback(event)
  }
}

const registerClickOutsideEvent = (
  site: ISite,
  component: IComponent,
  customEventHandlers: ICustomEvents,
) => {
  const eventWithArgs = customEventHandlers['clickOutside']

  if (eventWithArgs?.[0]) {
    runtimeContext.eventHandlers.click[component.id] = createClickawayListener(
      site,
      component.id,
      eventWithArgs[0],
    )
  }
}

const removeClickOutsideEvent = (component: IComponent) => {
  delete runtimeContext.eventHandlers.click[component.id]
}

const registerScrollIntoViewEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
  root: HTMLElement | null,
) => {
  const eventWithArgs = customEventHandlers['scrollIntoView']

  removeScrollIntoViewEvent(component)

  // Event is expected to trigger when the component is X(%/px) away from the top of the viewport (default to 0%).
  if (eventWithArgs?.[0]) {
    let margin = (eventWithArgs[1]?.margin?.value || '0%').replace(/\s/g, '')
    if (!margin.endsWith('%') && !margin.endsWith('px')) {
      // Use % as default unit
      margin = parseInt(margin) + '%'
    }

    const marginInt = parseInt(margin)
    if (marginInt < 0 || !Number.isFinite(marginInt)) {
      // Set margin to 0% when the value is invalid
      margin = '0%'
    }

    let direction = eventWithArgs[1]?.direction.value || 'down'
    if (!['up', 'down', 'both'].includes(direction)) {
      direction = 'down'
    }

    const rootHeight = (root ?? document.documentElement).getBoundingClientRect().height

    let rootMarginBottom = 0
    if (margin.endsWith('px')) {
      rootMarginBottom = -1 * (rootHeight - parseInt(margin))
    } else {
      // % as unit
      const height = rootHeight * (parseInt(margin) / 100)
      rootMarginBottom = -1 * (rootHeight - height)
    }

    let prevScrollTop = 0
    const isDown = ['down', 'both'].includes(direction)
    const isUp = ['up', 'both'].includes(direction)

    const observer = new IntersectionObserver(
      ([entry]) => {
        const { isIntersecting } = entry
        const currentScrollTop = (root ?? document.documentElement).scrollTop

        // Scroll down
        if (isIntersecting && isDown && prevScrollTop < currentScrollTop) {
          eventWithArgs[0]({ direction: 'down' } as unknown as Event)
        }
        // Scroll up
        if (!isIntersecting && isUp && prevScrollTop > currentScrollTop) {
          eventWithArgs[0]({ direction: 'up' } as unknown as Event)
        }

        prevScrollTop = currentScrollTop
      },
      { root, rootMargin: `0px 0px ${rootMarginBottom}px 0px` },
    )
    const target = document.getElementById(component.id)
    if (target) {
      observer.observe(target)
      runtimeContext.eventHandlers.scrollIntoView[component.id] = observer
    }
  }
}

const removeScrollIntoViewEvent = (component: IComponent) => {
  const observer = runtimeContext.eventHandlers.scrollIntoView[component.id]
  if (observer) {
    observer.disconnect()
    delete runtimeContext.eventHandlers.scrollIntoView[component.id]
  }
}

const registerPeriodicEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
) => {
  const eventWithArgs = customEventHandlers['periodic']

  removePeriodicEvent(component)

  if (eventWithArgs?.[0]) {
    runtimeContext.eventHandlers.periodic[component.id] = setInterval(
      eventWithArgs[0],
      toInt(eventWithArgs[1]?.interval.value, 1000),
    )
  }
}

const registerKeyEvents = (component: IComponent, customEventHandlers: ICustomEvents) => {
  const keydown = customEventHandlers['keydown']
  const keyup = customEventHandlers['keyup']

  if (keydown) {
    runtimeContext.eventHandlers.keydown[component.id] = (event: Event | undefined) =>
      keydown[0](event)
  }
  if (keyup) {
    runtimeContext.eventHandlers.keyup[component.id] = (event: Event | undefined) =>
      keyup[0](event)
  }
}

const registerScrollEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
) => {
  const scroll = customEventHandlers['scroll']

  if (scroll) {
    registerScroll(component.id, scroll[0])
  }
}

const removeScrollEvent = (component: IComponent) => {
  delete runtimeContext.eventHandlers.scroll[component.id]
}

const removeKeyEvents = (component: IComponent) => {
  delete runtimeContext.eventHandlers.keydown[component.id]
  delete runtimeContext.eventHandlers.keyup[component.id]
}

const removePeriodicEvent = (component: IComponent) => {
  if (runtimeContext.eventHandlers.periodic[component.id]) {
    clearInterval(runtimeContext.eventHandlers.periodic[component.id])
    delete runtimeContext.eventHandlers.periodic[component.id]
  }
}

const handleOnAppearEvent = (customEventHandlers: ICustomEvents) => {
  const eventWithArgs = customEventHandlers['appear']
  if (eventWithArgs) {
    eventWithArgs[0]()
  }
}

export const registerCustomEvents = (
  site: ISite,
  component: IComponent,
  isMounted: boolean,
) => {
  const { custom: customEventHandlers } = computeEvents(site, component)

  registerClickOutsideEvent(site, component, customEventHandlers)
  registerPeriodicEvent(component, customEventHandlers)
  registerScrollIntoViewEvent(component, customEventHandlers, null)
  registerKeyEvents(component, customEventHandlers)
  registerScrollEvent(component, customEventHandlers)
  if (isMounted) {
    handleOnAppearEvent(customEventHandlers)
  }
}

export const removeListeners = (component: IComponent): void => {
  removePeriodicEvent(component)
  removeClickOutsideEvent(component)
  removeScrollIntoViewEvent(component)
  removeKeyEvents(component)
  removeScrollEvent(component)
}
