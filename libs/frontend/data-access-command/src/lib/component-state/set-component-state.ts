import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { ISetComponentStateData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentState, ISite } from '@pubstudio/shared/type-site'

const setComponentState = (
  component: IComponent | undefined,
  oldKey: string | undefined,
  oldVal: IComponentState | undefined,
  newKey: string | undefined,
  newVal: IComponentState | undefined,
) => {
  if (!component) {
    return
  }
  const state = component.state ?? {}
  // Add
  if (!oldKey && newKey && newVal !== undefined) {
    state[newKey] = newVal
    // Remove
  } else if (oldKey && !newKey && newVal === undefined) {
    delete state[oldKey]
    // Set value
  } else if (oldKey && !newKey && newVal !== undefined) {
    state[oldKey] = newVal
    // Set key
  } else if (oldKey && newKey) {
    delete state[oldKey]
    if (newVal !== undefined) {
      state[newKey] = newVal
    } else if (oldVal !== undefined) {
      state[newKey] = oldVal
    }
  }
  if (Object.keys(state).length === 0) {
    component.state = undefined
  } else {
    component.state = state
  }
}

export const applySetComponentState = (site: ISite, data: ISetComponentStateData) => {
  const { componentId, oldKey, oldVal, newKey, newVal } = data
  const component = resolveComponent(site.context, componentId)
  setComponentState(component, oldKey, oldVal, newKey, newVal)
}

export const undoSetComponentState = (site: ISite, data: ISetComponentStateData) => {
  const { componentId, oldKey, oldVal, newKey, newVal } = data
  const component = resolveComponent(site.context, componentId)
  setComponentState(component, newKey, newVal, oldKey, oldVal)
}
