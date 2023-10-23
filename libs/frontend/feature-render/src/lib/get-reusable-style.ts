import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { mergePseudoStyle } from '@pubstudio/frontend/util-component'
import {
  createQueryStyle,
  IQueryStyle,
  IRawStyleRecord,
  rawStyleToResolvedStyle,
} from '@pubstudio/frontend/util-render'
import {
  CssPseudoClass,
  IPseudoStyle,
  IRawStyle,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'

export const getBuildReusableStyle = (site: ISite): IRawStyleRecord => {
  const { context, editor } = site

  const result: IRawStyleRecord = {}

  // Context styles
  Object.entries(context.styles).forEach(([mixinId, style]) => {
    // Compute active pseudo style from breakpoint styles
    let pseudoStyle: IPseudoStyle = {}
    for (const { id: breakpointId } of descSortedBreakpoints.value) {
      pseudoStyle = mergePseudoStyle(result, style.breakpoints[breakpointId])
      if (breakpointId === activeBreakpoint.value.id) {
        break
      }
    }

    const rawStyle: IRawStyle = {
      ...pseudoStyle.default,
    }

    if (editor && editor.cssPseudoClass !== CssPseudoClass.Default) {
      Object.assign(rawStyle, pseudoStyle[editor.cssPseudoClass] ?? {})
    }

    const resolvedStyle = rawStyleToResolvedStyle(context, rawStyle)
    result[`.${mixinId}`] = resolvedStyle
  })

  return result
}

export const getLiveReusableStyle = (context: ISiteContext): IQueryStyle => {
  const result = createQueryStyle(context)

  Object.entries(context.styles).forEach(([mixinId, style]) => {
    Object.entries(style.breakpoints).forEach(([breakpointId, pseudoStyle]) => {
      Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
        const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
        const resolvedStyle = rawStyleToResolvedStyle(context, rawStyle)
        result[breakpointId][`.${mixinId}${pseudoValue}`] = resolvedStyle
      })
    })
  })

  return result
}
