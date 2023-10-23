import { IComponentInput } from '@pubstudio/shared/type-site'

export interface ISetComponentInputData {
  componentId: string
  oldInput?: IComponentInput
  newInput?: IComponentInput
}
