import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export interface ICommandGroupData {
  commands: ICommand[]
}

export interface CommandGroup extends ICommand<ICommandGroupData> {
  type: CommandType.Group
}
