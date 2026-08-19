import { getBuiltinComponent } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import {
  IAddComponentChildData,
  IAddComponentData,
} from '@pubstudio/shared/type-command-data'
import { IComponent } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Convert a component subtree to self-contained child create data
const makeChildData = (component: IComponent): IAddComponentChildData => ({
  name: component.name,
  tag: component.tag,
  role: component.role,
  content: component.content,
  style: clone(component.style),
  state: clone(component.state),
  inputs: clone(component.inputs),
  events: clone(component.events),
  editorEvents: clone(component.editorEvents),
  children: component.children?.map(makeChildData),
})

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
    role: component.role,
    content: component.content,
    ...selectAddParent(parent, undefined),
    sourceId: component.id,
    children: component.children?.map(makeChildData),
    style: clone(component.style),
    state: clone(component.state),
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
