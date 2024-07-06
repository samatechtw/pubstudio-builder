import { IComponentState } from '@pubstudio/shared/type-site'

export interface ISetComponentStateData {
  componentId: string
  oldKey?: string
  newKey?: string
  oldVal?: IComponentState
  newVal?: IComponentState
}
