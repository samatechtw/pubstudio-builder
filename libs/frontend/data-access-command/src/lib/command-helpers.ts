import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { addComponentEventData } from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetBehaviorData,
  ISetComponentEventData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, IComponentEvent, ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { appendLastCommand } from './replace-last-command'

// Groups a list of commands with the previous command
export const mergeLastCommand = (site: ISite, commands: ICommand[]) => {
  if (commands.length === 0) {
    return
  }
  for (const command of commands) {
    applyCommand(site, command)
  }
  const last = getLastCommandHelper(site)
  if (last) {
    // If `last` is a group, append the new commands instead of creating another group
    const mergedCommands =
      last.type === CommandType.Group
        ? [...(last.data as ICommandGroupData).commands, ...commands]
        : [last, ...commands]
    site.history.back[site.history.back.length - 1] = {
      type: CommandType.Group,
      data: { commands: mergedCommands },
    }
  } else {
    site.history.back.push({ type: CommandType.Group, data: { commands } })
  }
}

export const getLastCommandHelper = (site: ISite): ICommand | undefined => {
  const history = site.history
  return history.back[history.back.length - 1]
}

export const getMissingBehaviorIds = (site: ISite, event: IComponentEvent): string[] => {
  return event.behaviors
    .map((b) => b.behaviorId)
    .filter((bid) => !resolveBehavior(site.context, bid))
}

export const setComponentEventWithMissingBehaviors = (
  data: ISetComponentEventData,
  missingBehaviorIds: string[],
): ICommand => {
  const commands: ICommand[] = [{ type: CommandType.SetComponentEvent, data }]
  for (const behaviorId of missingBehaviorIds) {
    const addBehaviorData: ISetBehaviorData = {
      newBehavior: clone(builtinBehaviors[behaviorId]),
    }
    commands.push({ type: CommandType.SetBehavior, data: addBehaviorData })
  }
  return { type: CommandType.Group, data: { commands } }
}

export const appendEvent = (
  site: ISite,
  component: IComponent,
  event: IComponentEvent,
  save?: boolean,
) => {
  const addEvent = addComponentEventData(component, event)
  const missingBehaviorIds = getMissingBehaviorIds(site, event)
  const command = setComponentEventWithMissingBehaviors(addEvent, missingBehaviorIds)
  appendLastCommand(site, command, save)
}
