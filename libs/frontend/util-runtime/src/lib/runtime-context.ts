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
  buildDndState: Ref<IBuildDndState | undefined>
  componentTreeItemRenameData: Ref<IComponentTreeItemRenameData>
  resetComponentTreeItemRenameData: () => void
  rightMenuFocused: Ref<boolean>
}

export interface ISize {
  width: number
  height: number
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

const initialHandlers = () => ({ click: {}, periodic: {}, scrollIntoView: {} })

const defaultComponentTreItemRenameData = (): IComponentTreeItemRenameData => ({
  treeItemId: undefined,
  renaming: false,
})

export const runtimeContext: IRuntimeContext = {
  eventHandlers: initialHandlers(),
  buildContentWindowSize: ref<ISize>({ width: 0, height: 0 }),
  hoveredComponentIdInComponentTree: ref<string>(),
  buildDndState: ref<IBuildDndState>(),
  componentTreeItemRenameData: ref(defaultComponentTreItemRenameData()),
  resetComponentTreeItemRenameData: () => {
    runtimeContext.componentTreeItemRenameData.value = defaultComponentTreItemRenameData()
  },
  rightMenuFocused: ref(false),
}

export const resetRuntimeContext = () => {
  runtimeContext.eventHandlers = initialHandlers()
  // We shouldn't reset `buildContentWindowSize` here. The height of build content window
  // will be re-calculated by resize observer.
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
  runtimeContext.buildDndState.value = undefined
  runtimeContext.componentTreeItemRenameData.value = defaultComponentTreItemRenameData()
  runtimeContext.rightMenuFocused.value = false
}
