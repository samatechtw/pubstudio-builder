import { IBreakpointStyles } from '@pubstudio/shared/type-site'

export interface IRemoveComponentOverrideStyleData {
  selector: string
  componentId: string
  styles: IBreakpointStyles
}
