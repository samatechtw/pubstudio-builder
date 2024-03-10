import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { selectAddParent } from './select-add-parent'

// Generate new component data from a reusable component
export const makeAddComponentFromReusableData = (
  site: ISite,
  reusableComponentId: string,
  parent: IComponent,
  selectedComponentId: string | undefined,
): IAddComponentData | undefined => {
  const reusableCmp = resolveComponent(site.context, reusableComponentId)
  if (!reusableCmp) {
    return undefined
  }
  const data: IAddComponentData = {
    tag: reusableCmp.tag,
    ...selectAddParent(parent, undefined),
    reusableComponentId: reusableCmp.id,
    selectedComponentId,
  }
  return data
}
