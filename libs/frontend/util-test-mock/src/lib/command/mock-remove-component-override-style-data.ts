import { IRemoveComponentOverrideStyleData } from '@pubstudio/shared/type-command-data'
import { IBreakpointStyles } from '@pubstudio/shared/type-site'

export const mockRemoveComponentOverrideStyleData = (
  componentId: string,
  selector: string,
  styles: IBreakpointStyles,
): IRemoveComponentOverrideStyleData => {
  const data: IRemoveComponentOverrideStyleData = {
    componentId,
    selector,
    styles,
  }
  return data
}
