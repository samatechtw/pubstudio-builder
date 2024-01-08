import { IBreakpoint } from '@pubstudio/shared/type-site'

export const breakpointSortFn = (a: IBreakpoint, b: IBreakpoint): number => {
  if (a.maxWidth === undefined && b.maxWidth === undefined) {
    return 0
  } else if (a.maxWidth === undefined) {
    return 1
  } else if (b.maxWidth === undefined) {
    return -1
  } else {
    return a.maxWidth - b.maxWidth
  }
}
