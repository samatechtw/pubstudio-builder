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

  for (const { id: breakpointId } of descSortedBreakpoints) {
    const pseudoClass = editor?.cssPseudoClass ?? CssPseudoClass.Default
    const sourceRawStyle = breakpointStyles[breakpointId]?.[pseudoClass] ?? {}

    Object.entries(sourceRawStyle).forEach(([css, source]) => {
      result[css as Css] = { ...source }
    })

    if (breakpointId === activeBreakpoint.id) {
      break
    }
  }

  return result
}
