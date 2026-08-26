import { isArenaId } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  IDetachInstanceData,
  IMoveComponentData,
  IReplacePageRootData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { isArenaScaffolding } from './component-arena'

interface IComponentTargetData {
  componentId?: string
  id?: string
  parentId?: string
}

const directComponentIds = (command: ICommand): string[] => {
  const data = command.data as IComponentTargetData
  return [data.componentId, data.id, data.parentId].filter(
    (id): id is string => typeof id === 'string',
  )
}

const unsupportedCommand = (type: never): never => {
  throw new Error(`Unsupported command type: ${type}`)
}

const commandComponentIds = (command: ICommand): string[] => {
  switch (command.type) {
    case CommandType.Group:
      return (command.data as ICommandGroupData).commands.flatMap(commandComponentIds)
    case CommandType.MoveComponent: {
      const { from, to } = command.data as IMoveComponentData
      return [from.parentId, to.parentId]
    }
    case CommandType.DetachInstance: {
      const { instance, replacement } = command.data as IDetachInstanceData
      return [
        instance.id,
        instance.parentId,
        replacement.id,
        replacement.parentId,
      ].filter((id): id is string => typeof id === 'string')
    }
    case CommandType.ReplacePageRoot: {
      const { oldRoot, replacementComponent } = command.data as IReplacePageRootData
      return [oldRoot.id, replacementComponent.id].filter(
        (id): id is string => typeof id === 'string',
      )
    }
    case CommandType.AddComponent:
    case CommandType.EditComponent:
    case CommandType.RemoveComponent:
    case CommandType.SetComponentCustomStyle:
    case CommandType.SetComponentOverrideStyle:
    case CommandType.RemoveComponentOverrideStyle:
    case CommandType.MergeComponentStyle:
    case CommandType.AddComponentMixin:
    case CommandType.RemoveComponentMixin:
    case CommandType.ReplaceComponentMixin:
    case CommandType.SetComponentInput:
    case CommandType.SetComponentEvent:
    case CommandType.SetComponentEditorEvent:
    case CommandType.ConvertToCustomComponent:
    case CommandType.RemoveCustomComponent:
    case CommandType.SetInstanceOverride:
    case CommandType.SetComponentState:
      return directComponentIds(command)
    case CommandType.Undo:
    case CommandType.Redo:
    case CommandType.SetBehavior:
    case CommandType.SetBehaviorArg:
    case CommandType.AddStyleMixin:
    case CommandType.EditStyleMixin:
    case CommandType.RemoveStyleMixin:
    case CommandType.UpdateMixinOrder:
    case CommandType.SetMixinEntry:
    case CommandType.AddThemeVariable:
    case CommandType.EditThemeVariable:
    case CommandType.RemoveThemeVariable:
    case CommandType.AddThemeFont:
    case CommandType.EditThemeFont:
    case CommandType.RemoveThemeFont:
    case CommandType.AddPage:
    case CommandType.EditPage:
    case CommandType.RemovePage:
    case CommandType.ChangePage:
    case CommandType.SetHomePage:
    case CommandType.SetDefaultsHead:
    case CommandType.SetPageHead:
    case CommandType.SetBreakpoint:
    case CommandType.SetTranslations:
    case CommandType.ReplaceTranslations:
    case CommandType.SetGlobalStyle:
    case CommandType.UpdateUi:
      return []
    default:
      return unsupportedCommand(command.type)
  }
}

enum ArenaCommandScope {
  Site,
  Scaffolding,
  Boundary,
}

const commandScope = (site: ISite, command: ICommand): ArenaCommandScope => {
  const ids = commandComponentIds(command)
  if (!ids.length) {
    return ArenaCommandScope.Site
  }
  // Agent batches are recorded after every command has already been applied. A later
  // command can therefore close and clear the arena before earlier commands are filtered.
  // Reserved arena ids preserve the scope even when their components no longer exist.
  const scaffoldCount = ids.filter((id) => {
    const component = resolveComponent(site.context, id)
    return isArenaId(id) || (!!component && isArenaScaffolding(site, component))
  }).length
  if (scaffoldCount === ids.length) {
    return ArenaCommandScope.Scaffolding
  }
  return scaffoldCount ? ArenaCommandScope.Boundary : ArenaCommandScope.Site
}

export const crossesArenaBoundary = (site: ISite, command: ICommand): boolean => {
  if (command.type === CommandType.Group) {
    return (command.data as ICommandGroupData).commands.some((child) =>
      crossesArenaBoundary(site, child),
    )
  }
  return commandScope(site, command) === ArenaCommandScope.Boundary
}

export const isScaffoldingCommand = (site: ISite, command: ICommand): boolean =>
  commandScope(site, command) === ArenaCommandScope.Scaffolding

// Retained history must remain valid after the arena has been discarded.
export const withoutScaffolding = (
  site: ISite,
  command: ICommand | undefined,
): ICommand | undefined => {
  if (!command) {
    return undefined
  }
  if (crossesArenaBoundary(site, command)) {
    throw new Error(
      'Components cannot be moved between component-edit scaffolding and site content.',
    )
  }
  if (command.type !== CommandType.Group) {
    return isScaffoldingCommand(site, command) ? undefined : command
  }
  const data = command.data as ICommandGroupData
  const commands = data.commands
    .map((child) => withoutScaffolding(site, child))
    .filter((child): child is ICommand => !!child)
  return commands.length
    ? { ...command, data: { ...data, commands } as ICommandGroupData }
    : undefined
}
