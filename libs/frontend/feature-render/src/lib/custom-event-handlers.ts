import { createClickawayListener } from '@pubstudio/frontend/util-clickaway'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import {
  ComponentEventType,
  IComponent,
  ICustomEvents,
} from '@pubstudio/shared/type-site'

const toInt = (thing: string | undefined, fallback: number): number => {
  if (thing === undefined) {
    return fallback
  }
  return parseInt(thing)
}

export const registerClickOutsideEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
) => {
  const eventWithArgs = customEventHandlers[ComponentEventType.ClickOutside]

  if (eventWithArgs?.[0]) {
    runtimeContext.eventHandlers.click[component.id] = createClickawayListener(
      `#${component.id}`,
      eventWithArgs[0],
    )
  }
}

export const removeClickOutsideEvent = (component: IComponent) => {
  delete runtimeContext.eventHandlers.click[component.id]
}

export const registerScrollIntoViewEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
  root: HTMLElement | null,
) => {
  const eventWithArgs = customEventHandlers[ComponentEventType.ScrollIntoView]

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        const { isIntersecting } = entry
        const currentScrollTop = (root ?? document.documentElement).scrollTop

        // Scroll down
        if (
          isIntersecting &&
          ['down', 'both'].includes(direction) &&
          prevScrollTop < currentScrollTop
        ) {
          eventWithArgs[0]()
        }

        // Scroll up
        if (
          !isIntersecting &&
          ['up', 'both'].includes(direction) &&
          prevScrollTop > currentScrollTop
        ) {
          eventWithArgs[0]()
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

export const removeScrollIntoViewEvent = (component: IComponent) => {
  const observer = runtimeContext.eventHandlers.scrollIntoView[component.id]
  if (observer) {
    observer.disconnect()
    delete runtimeContext.eventHandlers.scrollIntoView[component.id]
  }
}

export const registerPeriodicEvent = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
) => {
  const eventWithArgs = customEventHandlers[ComponentEventType.Periodic]

  removePeriodicEvent(component)

  if (eventWithArgs?.[0]) {
    runtimeContext.eventHandlers.periodic[component.id] = setInterval(
      eventWithArgs[0],
      toInt(eventWithArgs[1]?.interval.value, 1000),
    )
  }
}

export const removePeriodicEvent = (component: IComponent) => {
  if (runtimeContext.eventHandlers.periodic[component.id]) {
    clearInterval(runtimeContext.eventHandlers.periodic[component.id])
    delete runtimeContext.eventHandlers.periodic[component.id]
  }
}

export const handleOnAppearEvent = (customEventHandlers: ICustomEvents) => {
  const eventWithArgs = customEventHandlers[ComponentEventType.OnAppear]
  if (eventWithArgs) {
    eventWithArgs[0]()
  }
}

export const registerCustomEvents = (
  component: IComponent,
  customEventHandlers: ICustomEvents,
  root: HTMLElement | null,
  isMounted: boolean,
) => {
  registerClickOutsideEvent(component, customEventHandlers)
  registerPeriodicEvent(component, customEventHandlers)
  registerScrollIntoViewEvent(component, customEventHandlers, root)
  if (isMounted) {
    handleOnAppearEvent(customEventHandlers)
  }
}

export const removeListeners = (component: IComponent): void => {
  removePeriodicEvent(component)
  removeClickOutsideEvent(component)
  removeScrollIntoViewEvent(component)
}
