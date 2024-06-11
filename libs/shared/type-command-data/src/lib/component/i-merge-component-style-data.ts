import { IComponentStyle } from '@pubstudio/shared/type-site'

export interface IMergeComponentStyleData {
  componentId: string
  oldStyle: IComponentStyle
  newStyle: IComponentStyle
}
