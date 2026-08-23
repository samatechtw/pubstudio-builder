import { iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeCustomComponents } from '@pubstudio/frontend/util-site-deserialize'
import { IRemoveCustomComponentData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import {
  registerComponentEditorEvents,
  removeEditorEvents,
} from '../editor-event-handlers'
import { setSelectedComponent } from '../set-selected-component'
import {
  closeEditingComponent,
  insertCustomComponentId,
} from './custom-component-helpers'

// Callers must refuse while instances exist
export const applyRemoveCustomComponent = (
  site: ISite,
  data: IRemoveCustomComponentData,
) => {
  const { context } = site
  const component = resolveComponent(context, data.componentId)
  if (!component) {
    return
  }
  closeEditingComponent(site, data.componentId)
  context.customComponentIds.delete(data.componentId)
  const { componentTreeExpandedItems, componentsHidden } = site.editor ?? {}
  iterateComponent(component, (cmp) => {
    removeEditorEvents(site, cmp)
    delete context.components[cmp.id]
    delete componentTreeExpandedItems?.[cmp.id]
    delete componentsHidden?.[cmp.id]
  })
  if (site.editor?.selectedComponent?.id === data.componentId) {
    setSelectedComponent(site, undefined)
  }
}

export const undoRemoveCustomComponent = (
  site: ISite,
  data: IRemoveCustomComponentData,
) => {
  deserializeCustomComponents([data.component], site.context.components)
  insertCustomComponentId(site, data.componentId, data.index)
  iterateComponent(site.context.components[data.componentId], (cmp) => {
    registerComponentEditorEvents(site, cmp)
  })
}
