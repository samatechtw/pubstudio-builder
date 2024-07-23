import { Ref, VNode } from 'vue'

export interface IRuntimeContext {
  eventHandlers: {
    click: Record<string, EventHandler>
    keyup: Record<string, EventHandler>
    keydown: Record<string, EventHandler>
    // Store `setInterval` id
    periodic: Record<string, ReturnType<typeof setInterval>>
    scrollIntoView: Record<string, IntersectionObserver>
  }
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

export interface IComponentTreeItemRenameData {
  treeItemId: string | undefined
  renaming: boolean
}

export type EventHandler = (e: Event) => void

const initialHandlers = () => ({
  click: {},
  periodic: {},
  scrollIntoView: {},
  keyup: {},
  keydown: {},
})

export const runtimeContext: IRuntimeContext = {
  eventHandlers: initialHandlers(),
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

  document.removeEventListener('keyup', keyupHandler)
  document.removeEventListener('keydown', keydownHandler)
  document.addEventListener('keyup', keyupHandler)
  document.addEventListener('keydown', keydownHandler)
}
