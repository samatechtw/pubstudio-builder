import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, Tag } from '@pubstudio/shared/type-site'

// Determines which parent to add a new component to
// If the selectedComponent has text content, is an image, or is a custom instance, add to its parent instead
export const selectAddParent = (
  selectedComponent: IComponent | undefined,
  fallbackId: string | undefined,
): Pick<IAddComponentData, 'parentId' | 'parentIndex'> => {
  if (!selectedComponent) {
    return { parentId: fallbackId as string }
  }
  const { tag, content, customSourceId } = selectedComponent
  if (
    content ||
    tag === Tag.Img ||
    tag === Tag.Input ||
    tag === Tag.Textarea ||
    tag === Tag.Span ||
    customSourceId
  ) {
    const { parent, index } = findNonCustomPosition(
      selectedComponent,
      selectedComponent.parent,
    )
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

interface INonCustomPostion {
  parent: IComponent | undefined
  index: number | undefined
}

// Forbid inserting and dropping a component on a custom instance.
const findNonCustomPosition = (
  component: IComponent,
  parent: IComponent | undefined,
): INonCustomPostion => {
  if (!parent) {
    return {
      parent: undefined,
      index: undefined,
    }
  } else if (!parent.customSourceId) {
    const index = parent.children?.findIndex((c) => c.id === component.id)
    return {
      parent,
      index,
    }
  } else {
    return findNonCustomPosition(parent, parent.parent)
  }
}
