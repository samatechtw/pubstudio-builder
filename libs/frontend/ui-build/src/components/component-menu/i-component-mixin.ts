import { IStyle } from '@pubstudio/shared/type-site'

export interface IComponentMixin {
  id: string
  sourceReusableComponentId?: string
}

export interface IResolvedComponentMixin extends IComponentMixin {
  style: IStyle
}
