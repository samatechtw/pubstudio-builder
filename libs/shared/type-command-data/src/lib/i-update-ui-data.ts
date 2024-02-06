import { IOpenMixinMenuParams } from './update-ui/i-open-mixin-menu-params'
import { ICloseMixinMenuParams } from './update-ui/i-close-mixin-menu-params'

export interface IUpdateUiData<Action extends UiAction = never> {
  action: UiAction
  params?: IUpdateUiParams[Action]
}

export type IUpdateUiParams = {
  [UiAction.OpenMixinMenu]: IOpenMixinMenuParams
  [UiAction.CloseMixinMenu]: ICloseMixinMenuParams
}

export enum UiAction {
  OpenMixinMenu = 'oMM',
  CloseMixinMenu = 'cMM',
}
