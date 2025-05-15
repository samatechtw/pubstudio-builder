import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { makeSetInputData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISetComponentInputData } from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentInput, ISite } from '@pubstudio/shared/type-site'

export const addOrUpdateComponentInput = (
  site: ISite,
  component: IComponent | undefined,
  property: string,
  payload: Partial<IComponentInput>,
) => {
  const data = makeSetInputData(component, property, payload)
  if (data) {
    pushCommand(site, CommandType.SetComponentInput, data)
  }
}

export const addOrUpdateSelectedInput = (
  site: ISite,
  property: string,
  payload: Partial<IComponentInput>,
) => {
  const selected = site.editor?.selectedComponent
  addOrUpdateComponentInput(site, selected, property, payload)
}

export const removeComponentInput = (site: ISite, name: string) => {
  const selected = site.editor?.selectedComponent
  const oldInput = selected?.inputs?.[name]
  if (!selected) {
    return
  }
  const data: ISetComponentInputData = {
    componentId: selected.id,
    oldInput,
    newInput: undefined,
  }
  pushCommand(site, CommandType.SetComponentInput, data)
}

export const setSelectedIsInput = (site: ISite, prop: string, newValue: unknown) => {
  const selected = site.editor?.selectedComponent
  const data = makeSetInputData(selected, prop, {
    is: newValue,
  })
  if (data) {
    pushCommand(site, CommandType.SetComponentInput, data)
  }
}
