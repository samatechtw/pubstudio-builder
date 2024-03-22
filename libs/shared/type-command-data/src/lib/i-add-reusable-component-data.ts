import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export interface IAddReusableComponentData {
  componentIds: string[]
}

export interface AddReusableComponent extends ICommand<IAddReusableComponentData> {
  type: CommandType.AddReusableComponent
}
