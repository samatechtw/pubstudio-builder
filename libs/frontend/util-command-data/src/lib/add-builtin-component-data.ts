import { getBuiltinComponent } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Generate new component data from a builtin component
export const makeAddBuiltinComponentData = (
  builtinComponentId: string,
  parent: IComponent,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const builtinComponent = getBuiltinComponent(builtinComponentId)
  if (!builtinComponent) {
    return undefined
  }
  const data: IAddComponentData = {
    name: builtinComponent.name,
    tag: builtinComponent.tag,
    content: builtinComponent.content,
    ...selectAddParent(parent, undefined),
    sourceId: builtinComponent.id,
    children: builtinComponent.children,
    style: clone(builtinComponent.style),
    inputs: clone(builtinComponent.inputs),
    events: clone(builtinComponent.events),
    editorEvents: clone(builtinComponent.editorEvents),
    selectedComponentId,
  }
  return data
}
