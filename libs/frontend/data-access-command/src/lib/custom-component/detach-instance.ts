import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IDetachInstanceData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentStyleOverrides, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent, undoAddComponent } from '../component/add-component'
import {
  applyRemoveComponent,
  undoRemoveComponentHelper,
} from '../component/remove-component'

// The copy's children mirror the definition's in order, so override selectors can be
// moved onto the ids the copy was just given
const remapOverrides = (
  copy: IComponent,
  definition: IComponent | undefined,
): IComponentStyleOverrides | undefined => {
  const overrides = copy.style.overrides
  if (!overrides || !definition?.children || !copy.children) {
    return overrides
  }
  const remapped: IComponentStyleOverrides = {}
  for (const [selector, styles] of Object.entries(overrides)) {
    const index = definition.children.findIndex((child) => child.id === selector)
    const target = index === -1 ? selector : copy.children[index]?.id
    remapped[target ?? selector] = styles
  }
  return remapped
}

export const applyDetachInstance = (site: ISite, data: IDetachInstanceData) => {
  const definition = resolveComponent(site.context, data.instance.customComponentId)
  applyRemoveComponent(site, data.instance)
  const copy = applyAddComponent(site, data.replacement)
  copy.style.overrides = remapOverrides(copy, definition)
}

export const undoDetachInstance = (site: ISite, data: IDetachInstanceData) => {
  undoAddComponent(site, data.replacement)
  undoRemoveComponentHelper(site, data.instance, true)
}
