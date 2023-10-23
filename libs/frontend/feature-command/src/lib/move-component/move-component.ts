import { setSelectedComponent } from '@pubstudio/frontend/feature-editor'
import {
  IComponentPosition,
  IMoveComponentData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

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
      setSelectedComponent(site.editor, movedComponent)
    }
  }
}

export const applyMoveComponent = (site: ISite, data: IMoveComponentData) => {
  const { from, to } = data
  moveComponent(site, from, to)
}

export const undoMoveComponent = (site: ISite, data: IMoveComponentData) => {
  const { from, to } = data
  moveComponent(site, to, from)
}
