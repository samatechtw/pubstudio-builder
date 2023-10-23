import { Ref, ref } from 'vue'

export interface IRuntimeContext {
  eventHandlers: {
    click: Record<string, EventHandler>
    // Store `setInterval` id
    periodic: Record<string, ReturnType<typeof setInterval>>
    scrollIntoView: Record<string, IntersectionObserver>
  }
  buildContentWindowSize: Ref<ISize>
  hoveredComponentIdInComponentTree: Ref<string | undefined>
}

export interface ISize {
  width: number
  height: number
}

export type EventHandler = (e: Event) => void

const initialHandlers = () => ({ click: {}, periodic: {}, scrollIntoView: {} })

export const runtimeContext: IRuntimeContext = {
  eventHandlers: initialHandlers(),
  buildContentWindowSize: ref<ISize>({ width: 0, height: 0 }),
  hoveredComponentIdInComponentTree: ref<string>(),
}

export const resetRuntimeContext = () => {
  runtimeContext.eventHandlers = initialHandlers()
  // We shouldn't reset `buildContentWindowSize` here. The height of build content window
  // will be re-calculated by resize observer.
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
}
