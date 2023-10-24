import { IAddPageData } from '@pubstudio/shared/type-command-data'
import { IEditorContext, IPageMetadata } from '@pubstudio/shared/type-site'

export const mockAddPageData = (
  metadata: IPageMetadata,
  editor: IEditorContext,
): IAddPageData => {
  return {
    metadata,
    activePageRoute: editor.active,
    selectedComponentId: editor.selectedComponent?.id,
  }
}
