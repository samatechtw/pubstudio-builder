import { IRawStyle } from '@pubstudio/shared/type-site'

export type IRawStyleRecord = {
  // e.g. `#comp-id` or `#comp-id:hover`
  [cssSelector: string]: IRawStyle
}

export type IQueryStyle = {
  [breakpointId: string]: IRawStyleRecord
}

export interface IResolvedPageStyle {
  custom: IQueryStyle
  component: IQueryStyle
}
