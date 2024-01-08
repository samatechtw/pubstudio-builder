import { IRemoveComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const makeRemoveComponentData = (
  site: ISite,
  component: IComponent,
  allowRemoveRoot = false,
): IRemoveComponentData => {
  const parent = component.parent
  const parentIndex = parent?.children?.findIndex((c) => c.id === component.id)

  if (!allowRemoveRoot && (!parent || parentIndex === undefined)) {
    throw new Error('Cannot remove component with no parent')
  }
  return {
    id: component.id,
    name: component.name,
    tag: component.tag,
    content: component.content,
    parentId: parent?.id ?? '',
    children: component.children?.map((c) => makeRemoveComponentData(site, c)),
    style: component.style,
    inputs: component.inputs,
    events: component.events,
    editorEvents: site.editor?.editorEvents[component.id],
    parentIndex: parentIndex ?? 0,
  }
}
