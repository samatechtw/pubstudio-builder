import {
  IQueryStyle,
  createQueryStyle,
  rawStyleToResolvedStyle,
} from '@pubstudio/frontend/util-render'
import { CssPseudoClass, ISiteContext } from '@pubstudio/shared/type-site'

export const getReusableStyle = (context: ISiteContext): IQueryStyle => {
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
