import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { makeSetStateData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import { IComponent, IComponentState, ISite } from '@pubstudio/shared/type-site'

const pushSetState = (
  site: ISite,
  component: IComponent | undefined,
  oldKey: string | undefined,
  newKey: string | undefined,
  newVal: IComponentState | undefined,
) => {
  if (!component) {
    return
  }
  const data = makeSetStateData(component, oldKey, newKey, newVal)
  if (data) {
    pushCommand(site, CommandType.SetComponentState, data)
  }
}

export const addComponentState = (
  site: ISite,
  componentId: string,
  stateKey: string,
  stateVal: IComponentState,
) => {
  pushCommand(site, CommandType.SetComponentState, {
    componentId,
    newKey: stateKey,
    newVal: stateVal,
  })
}

export const removeComponentState = (
  site: ISite,
  component: IComponent | undefined,
  stateKey: string,
) => {
  pushSetState(site, component, stateKey, undefined, undefined)
}

export const setComponentState = (
  site: ISite,
  component: IComponent | undefined,
  oldKey: string,
  newKey: string | undefined,
  newVal: IComponentState,
) => {
  if (component?.state?.[oldKey] === newVal) {
    return
  }
  pushSetState(site, component, oldKey, newKey, newVal)
}
