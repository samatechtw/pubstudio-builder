import { resetRuntimeContext } from '@pubstudio/frontend/util-runtime'
import { Ref, ref } from 'vue'

export interface IBuilderContext {
  buildContentWindowSize: Ref<ISize>
  hoveredComponentIdInComponentTree: Ref<string | undefined>
  buildDndState: Ref<IBuildDndState | undefined>
  componentTreeItemRenameData: Ref<IComponentTreeItemRenameData>
  resetComponentTreeItemRenameData: () => void
  rightMenuFocused: Ref<boolean>
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

export interface IComponentTreeItemRenameData {
  treeItemId: string | undefined
  renaming: boolean
}

export type EventHandler = (e: Event) => void

const defaultComponentTreItemRenameData = (): IComponentTreeItemRenameData => ({
  treeItemId: undefined,
  renaming: false,
})

export const builderContext: IBuilderContext = {
  buildContentWindowSize: ref<ISize>({ width: 0, height: 0 }),
  hoveredComponentIdInComponentTree: ref<string>(),
  buildDndState: ref<IBuildDndState>(),
  componentTreeItemRenameData: ref(defaultComponentTreItemRenameData()),
  resetComponentTreeItemRenameData: () => {
    builderContext.componentTreeItemRenameData.value = defaultComponentTreItemRenameData()
  },
  rightMenuFocused: ref(false),
}

export const resetBuilderContext = () => {
  // We shouldn't reset `buildContentWindowSize` here. The height of build content window
  // will be re-calculated by resize observer.
  builderContext.hoveredComponentIdInComponentTree.value = undefined
  builderContext.buildDndState.value = undefined
  builderContext.componentTreeItemRenameData.value = defaultComponentTreItemRenameData()
  builderContext.rightMenuFocused.value = false
  resetRuntimeContext()
}
