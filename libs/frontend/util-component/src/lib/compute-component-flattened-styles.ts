import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import {
  Css,
  CssPseudoClass,
  IBreakpoint,
  IBreakpointStylesWithSource,
  IEditorContext,
  IRawStylesWithSource,
  StyleSourceType,
} from '@pubstudio/shared/type-site'

export const computeFlattenedStyles = (
  editor: IEditorContext | undefined,
  breakpointStyles: IBreakpointStylesWithSource,
  descSortedBreakpoints: IBreakpoint[],
  activeBreakpoint: IBreakpoint,
  includePseudoClass?: boolean,
): IRawStylesWithSource => {
  const result: IRawStylesWithSource = {}

  // Add styles with default breakpoint & default pseudo class to the result
  const defaultStyle =
    breakpointStyles[DEFAULT_BREAKPOINT_ID]?.[CssPseudoClass.Default] ?? {}

  Object.entries(defaultStyle).forEach(([css, source]) => {
    const styleWithSource = { ...source }
    if (includePseudoClass) {
      styleWithSource.sourcePseudoClass = CssPseudoClass.Default
    }
    result[css as Css] = styleWithSource
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
    // Skip default breakpoint with default pseudo class because
    // it's already added to the result before entering this for-loop.
    if (
      breakpointId === DEFAULT_BREAKPOINT_ID &&
      currentPseudoClass === CssPseudoClass.Default
    ) {
      continue
    }

    const sourceRawStyle = breakpointStyles[breakpointId]?.[currentPseudoClass] ?? {}

    Object.entries(sourceRawStyle).forEach(([css, source]) => {
      const key = css as Css
      // Only update the result when the source type is component custom style
      // since custom style has higher priority, or when the existing entry is
      // not from component custom style.
      if (
        source.sourceType === StyleSourceType.Custom ||
        result[key]?.sourceType !== StyleSourceType.Custom
      ) {
        const styleWithSource = { ...source }
        if (includePseudoClass) {
          styleWithSource.sourcePseudoClass = currentPseudoClass
        }
        result[key] = styleWithSource
      }
    })

    if (breakpointId === activeBreakpoint.id) {
      break
    }
  }

  return result
}
