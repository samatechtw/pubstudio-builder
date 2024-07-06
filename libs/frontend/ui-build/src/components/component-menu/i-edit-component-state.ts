import { IComponentState } from '@pubstudio/shared/type-site'

export interface IEditComponentState {
  key: string
  value: IComponentState
  isNew?: boolean
}
