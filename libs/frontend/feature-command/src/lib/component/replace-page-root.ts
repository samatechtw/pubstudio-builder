import { setSelectedComponent } from '@pubstudio/frontend/feature-editor'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { IReplacePageRootData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { addComponentHelper, undoAddComponent } from './add-component'
import { applyRemoveComponent, undoRemoveComponentHelper } from './remove-component'

export const applyReplacePageRoot = (site: ISite, data: IReplacePageRootData) => {
  const { pageRoute, oldRoot, replacementComponent } = data

  // Create new root
  const newRoot = addComponentHelper(site, replacementComponent)
  replacementComponent.id = newRoot.id
  site.pages[pageRoute].root = newRoot

  // Remove old root
  applyRemoveComponent(site, oldRoot)

  // Select new root
  setSelectedComponent(site, newRoot)
}

export const undoReplacePageRoot = (site: ISite, data: IReplacePageRootData) => {
  const { pageRoute, oldRoot, replacementComponent } = data

  // Reomve new root
  undoAddComponent(site, replacementComponent)

  // Recover old root
  undoRemoveComponentHelper(site, oldRoot, false)

  const resolvedOldRoot = resolveComponent(site.context, oldRoot.id)
  if (!resolvedOldRoot) {
    throw new Error(
      `Cannot find component with ID ${oldRoot.id} when undo replace page root`,
    )
  }
  site.pages[pageRoute].root = resolvedOldRoot
}
