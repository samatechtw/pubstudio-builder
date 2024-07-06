import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISetComponentStateData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentState, ISite } from '@pubstudio/shared/type-site'

export const addComponentState = (
  site: ISite,
  componentId: string,
  stateKey: string,
  stateVal: IComponentState,
) => {
  const data: ISetComponentStateData = {
    componentId,
    newKey: stateKey,
    newVal: stateVal,
  }
  pushCommand(site, CommandType.SetComponentState, data)
}

export const removeComponentState = (
  site: ISite,
  component: IComponent | undefined,
  stateKey: string,
) => {
  const oldVal = component?.state?.[stateKey]
  if (!component || oldVal === undefined) {
    return
  }
  const data: ISetComponentStateData = {
    componentId: component.id,
    oldKey: stateKey,
    oldVal,
  }
  pushCommand(site, CommandType.SetComponentState, data)
}

export const setComponentState = (
  site: ISite,
  component: IComponent | undefined,
  oldKey: string,
  newKey: string | undefined,
  newVal: IComponentState,
) => {
  const oldVal = component?.state?.[oldKey]
  if (!component || oldVal === undefined || oldVal === newVal) {
    return
  }
  const data: ISetComponentStateData = {
    componentId: component.id,
    oldKey,
    newKey,
    newVal,
  }
  pushCommand(site, CommandType.SetComponentState, data)
}
