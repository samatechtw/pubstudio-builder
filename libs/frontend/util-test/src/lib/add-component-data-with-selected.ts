import { mockAddComponentData } from '@pubstudio/frontend/util-test-mock'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IEditorContext, ISerializedComponent } from '@pubstudio/shared/type-site'

export const addComponentDataWithSelected = (
  serialized: ISerializedComponent,
  editor: IEditorContext | undefined,
  sourceId?: string,
): IAddComponentData => {
  const data = mockAddComponentData(serialized, sourceId)
  data.selectedComponentId = editor?.selectedComponent?.id
  return data
}
