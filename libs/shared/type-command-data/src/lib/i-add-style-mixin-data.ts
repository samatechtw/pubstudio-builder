import { IBreakpointStyles } from '@pubstudio/shared/type-site'

export interface IAddStyleMixinData {
  // Optional pre-calculated ID, used for copying builtin styles to the site context
  id?: string
  // Human readable name
  name?: string
  breakpoints: IBreakpointStyles
}
