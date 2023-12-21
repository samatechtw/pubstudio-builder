import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, Tag } from '@pubstudio/shared/type-site'

// Determines which parent to add a new component to
// If the selectedComponent has text content or is an image, add to its parent instead
export const selectAddParent = (
  selectedComponent: IComponent | undefined,
  fallbackId: string | undefined,
): Pick<IAddComponentData, 'parentId' | 'parentIndex'> => {
  if (!selectedComponent) {
    return { parentId: fallbackId as string }
  }
  const { tag, content } = selectedComponent
  if (
    content ||
    tag === Tag.Img ||
    tag === Tag.Input ||
    tag === Tag.Textarea ||
    tag === Tag.Span
  ) {
    const parent = selectedComponent.parent
    const index = parent?.children?.findIndex((c) => c.id === selectedComponent.id)
    const parentId = parent?.id ?? fallbackId
    if (parentId) {
      return {
        parentId,
        parentIndex: index === undefined ? undefined : index + 1,
      }
    }
  }
  return { parentId: selectedComponent?.id }
}
