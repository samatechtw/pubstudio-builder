import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IAddCustomComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

// Superseded by ConvertToCustomComponent; kept so stored histories still replay
export const applyAddCustomComponent = (site: ISite, data: IAddCustomComponentData) => {
  const component = resolveComponent(site.context, data.componentId)
  if (component) {
    site.context.customComponentIds.add(component.id)
  }
}

export const undoAddCustomComponent = (site: ISite, data: IAddCustomComponentData) => {
  site.context.customComponentIds.delete(data.componentId)
}
