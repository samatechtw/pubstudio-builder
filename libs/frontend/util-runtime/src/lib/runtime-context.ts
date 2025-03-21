import { EventHandler } from '@pubstudio/shared/type-site'
import { Ref, VNode } from 'vue'

export interface IRuntimeContext {
  eventHandlers: {
    click: Record<string, EventHandler>
    keyup: Record<string, EventHandler>
    keydown: Record<string, EventHandler>
    // Store `setInterval` id
    periodic: Record<string, ReturnType<typeof setInterval>>
    scrollIntoView: Record<string, IntersectionObserver>
    scroll: Record<string, EventHandler>
  }
  scrollEventAdded: boolean
  loadVueComponent: ILoadVueComponent
}

export interface ILoadVueComponent {
  loadComponentTimer: ReturnType<typeof setTimeout> | undefined
  loadedComponents: Record<string, Ref<VNode | undefined>>
  retries: number
}

export interface IBuildDndState {
  hoverSelf: boolean
  hoverTop: boolean
  hoverRight: boolean
  hoverBottom: boolean
  hoverLeft: boolean
  hoverCmpId: string
  hoverCmpParentIsRow: boolean
}

export interface IComponentTreeRenameData {
  treeItemId: string | undefined
  renaming: boolean
}

const initialHandlers = () => ({
  click: {},
  periodic: {},
  scrollIntoView: {},
  keyup: {},
  keydown: {},
  scroll: {},
})

export const runtimeContext: IRuntimeContext = {
  eventHandlers: initialHandlers(),
  scrollEventAdded: false,
  loadVueComponent: {
    loadComponentTimer: undefined,
    loadedComponents: {},
    retries: 0,
  },
}

const keyupHandler = (e: KeyboardEvent) => {
  for (const event of Object.values(runtimeContext.eventHandlers.keyup)) {
    event(e)
  }
}

const keydownHandler = (e: KeyboardEvent) => {
  for (const event of Object.values(runtimeContext.eventHandlers.keydown)) {
    event(e)
  }
}

const scrollHandler = () => {
  for (const handler of Object.values(runtimeContext.eventHandlers.scroll)) {
    handler()
  }
}

export const registerScroll = (id: string, handler: EventHandler) => {
  runtimeContext.eventHandlers.scroll[id] = handler
  if (!runtimeContext.scrollEventAdded) {
    runtimeContext.scrollEventAdded = true
    document.addEventListener('scroll', scrollHandler, { passive: true })
  }
}

export const resetRuntimeContext = () => {
  runtimeContext.eventHandlers = initialHandlers()
  if (runtimeContext.loadVueComponent.loadComponentTimer) {
    clearInterval(runtimeContext.loadVueComponent.loadComponentTimer)
  }
  runtimeContext.loadVueComponent = {
    loadComponentTimer: undefined,
    loadedComponents: {},
    retries: 0,
  }
  runtimeContext.scrollEventAdded = false
  document.removeEventListener('scroll', scrollHandler)
  document.removeEventListener('keyup', keyupHandler)
  document.removeEventListener('keydown', keydownHandler)
  document.addEventListener('keyup', keyupHandler)
  document.addEventListener('keydown', keydownHandler)
}
