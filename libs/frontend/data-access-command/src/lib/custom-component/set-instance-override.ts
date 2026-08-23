import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { ISetInstanceOverrideData } from '@pubstudio/shared/type-command-data'
import { IComponent, IInstanceOverride, ISite } from '@pubstudio/shared/type-site'
import { setSelectedComponent } from '../set-selected-component'

const setOverride = (
  component: IComponent,
  childId: string,
  override: IInstanceOverride | undefined,
) => {
  if (!override || (override.content === undefined && !override.inputs)) {
    delete component.instanceOverrides?.[childId]
    if (!Object.keys(component.instanceOverrides ?? {}).length) {
      component.instanceOverrides = undefined
    }
  } else {
    component.instanceOverrides = { ...component.instanceOverrides, [childId]: override }
  }
}

// Selection follows the edit, so undo and redo land back on the same child
const selectChild = (site: ISite, component: IComponent, childId: string) => {
  setSelectedComponent(site, component)
  if (site.editor) {
    site.editor.selectedInstanceChildId = childId
  }
}

export const applySetInstanceOverride = (site: ISite, data: ISetInstanceOverrideData) => {
  const component = resolveComponent(site.context, data.componentId)
  if (component) {
    setOverride(component, data.childId, data.newOverride)
    selectChild(site, component, data.childId)
  }
}

export const undoSetInstanceOverride = (site: ISite, data: ISetInstanceOverrideData) => {
  const component = resolveComponent(site.context, data.componentId)
  if (component) {
    setOverride(component, data.childId, data.oldOverride)
    selectChild(site, component, data.childId)
  }
}
