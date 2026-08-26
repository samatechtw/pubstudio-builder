import { wouldCreateCustomComponentCycle } from '@pubstudio/frontend/util-component'
import { iterateComponent } from '@pubstudio/frontend/util-render'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentBaseData,
  IAddComponentData,
  ICommandGroupData,
  IMoveComponentData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { crossesArenaBoundary } from './custom-component/arena-history'

const addCycleDefinition = (
  site: ISite,
  data: IAddComponentBaseData,
  parentId: string,
): string | undefined => {
  if (
    data.customComponentId &&
    wouldCreateCustomComponentCycle(site.context, data.customComponentId, parentId)
  ) {
    return data.customComponentId
  }
  for (const child of data.children ?? []) {
    const definitionId = addCycleDefinition(site, child, parentId)
    if (definitionId) {
      return definitionId
    }
  }
  return undefined
}

const moveValidationError = (site: ISite, data: IMoveComponentData) => {
  const fromParent = site.context.components[data.from.parentId]
  const moved = fromParent?.children?.[data.from.index]
  const toParent = site.context.components[data.to.parentId]
  if (!moved || !toParent) {
    return undefined
  }

  let ancestor: IComponent | undefined = toParent
  while (ancestor) {
    if (ancestor.id === moved.id) {
      return `Component ${moved.id} cannot be moved inside itself.`
    }
    ancestor = ancestor.parent
  }

  let cycleDefinition: string | undefined
  iterateComponent(moved, (component) => {
    if (
      !cycleDefinition &&
      component.customSourceId &&
      wouldCreateCustomComponentCycle(site.context, component.customSourceId, toParent.id)
    ) {
      cycleDefinition = component.customSourceId
    }
  })
  return cycleDefinition
    ? `Custom component ${cycleDefinition} cannot be moved inside itself.`
    : undefined
}

export const commandValidationError = (
  site: ISite,
  command: ICommand,
): string | undefined => {
  if (crossesArenaBoundary(site, command)) {
    return 'Components cannot be moved between component-edit scaffolding and site content.'
  }
  if (command.type === CommandType.Group) {
    for (const child of (command.data as ICommandGroupData).commands) {
      const error = commandValidationError(site, child)
      if (error) {
        return error
      }
    }
    return undefined
  }
  if (command.type === CommandType.AddComponent) {
    const data = command.data as IAddComponentData
    const definitionId = addCycleDefinition(site, data, data.parentId)
    return definitionId
      ? `Custom component ${definitionId} cannot be instantiated inside itself.`
      : undefined
  }
  if (command.type === CommandType.MoveComponent) {
    return moveValidationError(site, command.data as IMoveComponentData)
  }
  return undefined
}

export const assertValidCommand = (site: ISite, command: ICommand) => {
  const error = commandValidationError(site, command)
  if (error) {
    throw new Error(error)
  }
}
