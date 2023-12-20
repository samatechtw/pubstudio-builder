import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'

export const optimizeCommandGroup = <Data>(command: ICommand): ICommand | undefined => {
  // Unwrap a group of 1 command to improve performance
  if (command.type === CommandType.Group) {
    const { commands } = command.data as ICommandGroupData
    if (commands.length === 1) {
      command.type = commands[0].type
      command.data = commands[0].data as Data
    } else if (commands.length === 0) {
      // Ignore empty command group
      return undefined
    }
  }
  return command
}
