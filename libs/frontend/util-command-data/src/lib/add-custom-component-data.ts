import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Generate new component data from a custom component
export const makeAddCustomComponentData = (
  site: ISite,
  customComponentId: string,
  parent: IComponent,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const customCmp = resolveComponent(site.context, customComponentId)
  if (!customCmp) {
    return undefined
  }
  const data: IAddComponentData = {
    tag: customCmp.tag,
    ...selectAddParent(parent, undefined),
    customComponentId: customCmp.id,
    selectedComponentId,
  }
  return data
}
