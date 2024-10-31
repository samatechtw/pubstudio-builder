import { getBuiltinComponent } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Generate new component data from an existing component
// Used for complex builtin components that need some pre-processing/dynamic children
export const makeAddComponentData = (
  component: IComponent,
  parent: IComponent | undefined,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const data: IAddComponentData = {
    name: component.name,
    tag: component.tag,
    content: component.content,
    ...selectAddParent(parent, undefined),
    sourceId: component.id,
    children: component.children,
    style: clone(component.style),
    inputs: clone(component.inputs),
    events: clone(component.events),
    editorEvents: clone(component.editorEvents),
    selectedComponentId,
  }
  return data
}

// Generate new component data from a builtin component
export const makeAddBuiltinComponentData = (
  builtinComponentId: string,
  parent: IComponent | undefined,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const builtinComponent = getBuiltinComponent(builtinComponentId)
  if (!builtinComponent) {
    return undefined
  }
  return makeAddComponentData(builtinComponent, parent, selectedComponentId)
}
