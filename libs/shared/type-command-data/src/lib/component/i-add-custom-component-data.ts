import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export interface IAddCustomComponentData {
  componentId: string
}

export interface AddCustomComponent extends ICommand<IAddCustomComponentData> {
  type: CommandType.AddCustomComponent
}
