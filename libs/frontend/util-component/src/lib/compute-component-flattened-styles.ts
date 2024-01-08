import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import {
  Css,
  CssPseudoClass,
  IBreakpoint,
  IBreakpointStylesWithSource,
  IEditorContext,
  IRawStylesWithSource,
} from '@pubstudio/shared/type-site'

export const computeComponentFlattenedStyles = (
  editor: IEditorContext | undefined,
  breakpointStyles: IBreakpointStylesWithSource,
  descSortedBreakpoints: IBreakpoint[],
  activeBreakpoint: IBreakpoint,
): IRawStylesWithSource => {
  const result: IRawStylesWithSource = {}

  // Add styles with default breakpoint & default pseudo class to the result
  const defaultStyle =
    breakpointStyles[DEFAULT_BREAKPOINT_ID]?.[CssPseudoClass.Default] ?? {}

  Object.entries(defaultStyle).forEach(([css, source]) => {
    result[css as Css] = { ...source }
  })

  const currentPseudoClass = editor?.cssPseudoClass ?? CssPseudoClass.Default

  if (
    activeBreakpoint.id === DEFAULT_BREAKPOINT_ID &&
    currentPseudoClass === CssPseudoClass.Default
  ) {
    return result
  }

  // Add other styles to the result
  for (const { id: breakpointId } of descSortedBreakpoints) {
    if (
      breakpointId === DEFAULT_BREAKPOINT_ID &&
      currentPseudoClass === CssPseudoClass.Default
    ) {
      continue
    }

    const sourceRawStyle = breakpointStyles[breakpointId]?.[currentPseudoClass] ?? {}

    Object.entries(sourceRawStyle).forEach(([css, source]) => {
      result[css as Css] = { ...source }
    })

    if (breakpointId === activeBreakpoint.id) {
      break
    }
  }

  return result
}
