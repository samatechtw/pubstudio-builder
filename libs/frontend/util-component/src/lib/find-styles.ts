import {
  Css,
  IBreakpoint,
  IComponent,
  IRawStyle,
  ISite,
} from '@pubstudio/shared/type-site'
import { computeComponentBreakpointStyles } from './compute-component-breakpoint-styles'
import { computeComponentFlattenedStyles } from './compute-component-flattened-styles'

export const findStyles = (
  finds: Css[],
  site: ISite,
  component: IComponent,
  descSortedBreakpoints: IBreakpoint[],
  activeBreakpoint: IBreakpoint,
): IRawStyle => {
  const result: IRawStyle = {}
  const breakpointStyles = computeComponentBreakpointStyles(site.context, component)
  const flattenedStyles = computeComponentFlattenedStyles(
    site.editor,
    breakpointStyles,
    descSortedBreakpoints,
    activeBreakpoint,
  )
  for (const css of finds) {
    if (css in flattenedStyles) {
      result[css] = flattenedStyles[css]?.value
    }
  }
  return result
}
