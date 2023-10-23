import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddComponentData } from './i-add-component-data'

// We need to be able to recreate the component for undo
export interface IRemoveComponentData extends Omit<IAddComponentData, 'childIds'> {
  id: string
  children?: IRemoveComponentData[]
  parentIndex: number
}

export interface RemoveComponent extends ICommand<IRemoveComponentData> {
  type: CommandType.RemoveComponent
}
