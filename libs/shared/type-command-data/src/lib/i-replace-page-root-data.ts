import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddComponentData } from './component/i-add-component-data'
import { IRemoveComponentData } from './component/i-remove-component-data'

export interface IReplacePageRootData {
  pageRoute: string
  oldRoot: IRemoveComponentData
  replacementComponent: IAddComponentData
}

export interface ReplacePageRoot extends ICommand<IReplacePageRootData> {
  type: CommandType.ReplacePageRoot
}
