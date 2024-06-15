import { IStyle } from '@pubstudio/shared/type-site'

export interface IComponentMixin {
  id: string
  sourceCustomComponentId?: string
}

export interface IResolvedComponentMixin extends IComponentMixin {
  style: IStyle
}
