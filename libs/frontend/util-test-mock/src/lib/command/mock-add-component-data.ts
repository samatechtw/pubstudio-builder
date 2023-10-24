import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { ISerializedComponent } from '@pubstudio/shared/type-site'

export const mockAddComponentData = (
  serialized: ISerializedComponent,
  sourceId?: string,
): IAddComponentData => {
  const data: IAddComponentData = {
    name: serialized.name,
    tag: serialized.tag,
    content: serialized.content,
    parentId: serialized.parentId as string,
    sourceId,
    style: serialized.style,
    inputs: serialized.inputs,
    events: serialized.events,
  }
  return data
}
