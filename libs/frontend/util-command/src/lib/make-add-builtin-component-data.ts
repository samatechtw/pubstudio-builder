import { selectAddParent } from '@pubstudio/frontend/util-build'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

// Generate new component data from a builtin component
export const makeAddBuiltinComponentData = (
  site: ISite,
  builtinComponentId: string,
  parent: IComponent,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const builtinComponent = resolveComponent(site.context, builtinComponentId)
  if (!builtinComponent) {
    return undefined
  }
  const data: IAddComponentData = {
    name: builtinComponent.name,
    tag: builtinComponent.tag,
    content: builtinComponent.content,
    ...selectAddParent(parent, undefined),
    sourceId: builtinComponent.id,
    inputs: structuredClone(builtinComponent.inputs),
    events: structuredClone(builtinComponent.events),
    editorEvents: structuredClone(builtinComponent.editorEvents),
    selectedComponentId,
  }
  return data
}
