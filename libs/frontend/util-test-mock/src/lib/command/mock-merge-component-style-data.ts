import { IMergeComponentStyleData } from '@pubstudio/shared/type-command-data'
import { IComponentStyle } from '@pubstudio/shared/type-site'

export const mockMergeComponentStyleData = (
  componentId: string,
  oldStyle: IComponentStyle,
  newStyle: IComponentStyle,
): IMergeComponentStyleData => {
  const data: IMergeComponentStyleData = {
    componentId,
    oldStyle,
    newStyle,
  }
  return data
}
