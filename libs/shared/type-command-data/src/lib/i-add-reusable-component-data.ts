import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export interface IAddReusableComponentData {
  componentId: string
}

export interface AddReusableComponent extends ICommand<IAddReusableComponentData> {
  type: CommandType.AddReusableComponent
}
