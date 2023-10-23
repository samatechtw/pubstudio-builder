import { IComponent } from '@pubstudio/shared/type-site'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'

export type IEditComponentFields = Partial<
  Pick<IComponent, 'name' | 'tag' | 'role' | 'content'>
>

export interface IEditComponentData {
  id: string
  new: IEditComponentFields
  old: IEditComponentFields
}

export interface EditComponent extends ICommand<IEditComponentData> {
  type: CommandType.EditComponent
}
