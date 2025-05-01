import { resetRuntimeContext } from '@pubstudio/frontend/util-runtime'
import { Ref, ref } from 'vue'

export interface IBuilderContext {
  buildContentWindowSize: Ref<ISize>
  hoveredComponentIdInComponentTree: Ref<string | undefined>
  buildDndState: Ref<IBuildDndState | undefined>
  rightMenuFocused: Ref<boolean>
  shiftPressed: Ref<boolean>
  prosemirrorFocused: Ref<boolean>
}

interface ISize {
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

export type EventHandler = (e: Event) => void

export const builderContext: IBuilderContext = {
  buildContentWindowSize: ref<ISize>({ width: 0, height: 0 }),
  hoveredComponentIdInComponentTree: ref<string>(),
  buildDndState: ref<IBuildDndState>(),
  rightMenuFocused: ref(false),
  shiftPressed: ref(false),
  prosemirrorFocused: ref(false),
}

export const resetBuilderContext = () => {
  // We shouldn't reset `buildContentWindowSize` here. The height of build content window
  // will be re-calculated by resize observer.
  builderContext.hoveredComponentIdInComponentTree.value = undefined
  builderContext.buildDndState.value = undefined
  builderContext.rightMenuFocused.value = false
  builderContext.prosemirrorFocused.value = false
  resetRuntimeContext()
}
