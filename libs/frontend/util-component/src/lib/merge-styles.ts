import {
  Css,
  CssPseudoClass,
  IBreakpointStylesWithSource,
  IPseudoStyle,
  IRawStylesWithSource,
} from '@pubstudio/shared/type-site'

// Custom styles should be merged and de-duplicated with existing ones; new styles take precedence.
export const mergePseudoStyle = (
  oldStyle: IPseudoStyle,
  newStyle: IPseudoStyle,
): IPseudoStyle => {
  const mergedStyle = structuredClone(oldStyle)
  for (const key in newStyle) {
    const castedKey = key as keyof IPseudoStyle
    mergedStyle[castedKey] = {
      ...mergedStyle[castedKey],
      ...newStyle[castedKey],
    }
  }
  return mergedStyle
}

export const mergeBreakpointStylesWithSource = (
  ...breakpointStyles: IBreakpointStylesWithSource[]
): IBreakpointStylesWithSource => {
  const result: IBreakpointStylesWithSource = {}

  for (const breakpointStyle of breakpointStyles) {
    Object.entries(breakpointStyle).forEach(([breakpointId, sourcePseudoStyle]) => {
      if (!result[breakpointId]) {
        result[breakpointId] = {}
      }
      const pseudoStyle = result[breakpointId]

      Object.entries(sourcePseudoStyle).forEach(([pseudoClass, sourceRawStyle]) => {
        if (!pseudoStyle[pseudoClass as CssPseudoClass]) {
          pseudoStyle[pseudoClass as CssPseudoClass] = {}
        }
        const rawStyle = pseudoStyle[
          pseudoClass as CssPseudoClass
        ] as IRawStylesWithSource

        Object.entries(sourceRawStyle).forEach(([css, source]) => {
          rawStyle[css as Css] = { ...source }
        })
      })
    })
  }

  return result
}
