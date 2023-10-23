import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'

export const mergeLastCommandHelper = (site: ISite, commands: ICommand[]) => {
  if (commands.length === 0) {
    return
  }
  for (const command of commands) {
    applyCommand(site, command.type, command.data)
  }
  const last = getLastCommandHelper(site)
  if (last) {
    // TODO -- if `last` is a group, append the new commands instead of creating another group
    commands.unshift(last)
    site.history.back[history.back.length - 1] = {
      type: CommandType.Group,
      data: { commands },
    }
  } else {
    site.history.back.push({ type: CommandType.Group, data: { commands } })
  }
}

export const getLastCommandHelper = (site: ISite): ICommand | undefined => {
  const history = site.history
  return history.back[history.back.length - 1]
}
