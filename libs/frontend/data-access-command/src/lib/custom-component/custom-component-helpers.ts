import { ISite } from '@pubstudio/shared/type-site'

// Definition ids serialize as an ordered array, so undo has to restore position
export const insertCustomComponentId = (site: ISite, id: string, index: number) => {
  const ids = Array.from(site.context.customComponentIds).filter((i) => i !== id)
  ids.splice(index, 0, id)
  site.context.customComponentIds = new Set(ids)
}

export const customComponentIndex = (site: ISite, id: string): number =>
  Array.from(site.context.customComponentIds).indexOf(id)

export const closeEditingComponent = (site: ISite, definitionId: string) => {
  if (site.editor?.editingComponentId === definitionId) {
    site.editor.editingComponentId = undefined
  }
}
