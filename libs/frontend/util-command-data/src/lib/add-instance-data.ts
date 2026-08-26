import { wouldCreateCustomComponentCycle } from '@pubstudio/frontend/util-component'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Data for a new instance of a custom component
export const makeAddInstanceData = (
  site: ISite,
  customComponentId: string,
  parent: IComponent,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const customCmp = resolveComponent(site.context, customComponentId)
  const position = selectAddParent(parent, undefined)
  if (
    !customCmp ||
    wouldCreateCustomComponentCycle(site.context, customCmp.id, position.parentId)
  ) {
    return undefined
  }
  const data: IAddComponentData = {
    tag: customCmp.tag,
    name: customCmp.name,
    ...position,
    customComponentId: customCmp.id,
    selectedComponentId,
  }
  return data
}
