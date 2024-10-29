import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'

export const pushGroupCommands = (site: ISite, commands: ICommand[]) => {
  pushCommand(site, CommandType.Group, { commands })
}
