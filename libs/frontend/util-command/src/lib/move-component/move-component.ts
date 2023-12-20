import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import {
  IComponentPosition,
  IMoveComponentData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

// Returns moved component
const moveComponent = (site: ISite, from: IComponentPosition, to: IComponentPosition) => {
  const { components } = site.context
  const [fromParent, toParent] = [components[from.parentId], components[to.parentId]]

  if (fromParent && toParent) {
    // Splice component from one parent to another
    const movedComponent = fromParent.children?.splice(from.index, 1)[0]
    if (movedComponent) {
      if (!toParent.children) {
        toParent.children = []
      }
      toParent.children.splice(to.index, 0, movedComponent)
      movedComponent.parent = toParent
      return movedComponent
    }
  }

  return undefined
}

export const applyMoveComponent = (site: ISite, data: IMoveComponentData) => {
  const { from, to } = data
  const movedComponent = moveComponent(site, from, to)
  setSelectedComponent(site, movedComponent)
}

export const undoMoveComponent = (site: ISite, data: IMoveComponentData) => {
  const { from, to, selectedComponentId } = data
  moveComponent(site, to, from)
  const prevSelectedComponent = resolveComponent(site.context, selectedComponentId)
  setSelectedComponent(site, prevSelectedComponent)
}
