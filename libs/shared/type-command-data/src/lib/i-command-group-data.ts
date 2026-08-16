import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export interface ICommandGroupData {
  commands: ICommand[]
  // Optional description of the batch, shown when listing history
  label?: string
}

export interface CommandGroup extends ICommand<ICommandGroupData> {
  type: CommandType.Group
}
