import { resolveStyle } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  CssPseudoClassType,
  IBreakpointStylesWithSource,
  IComponent,
  IPseudoStyle,
  IPseudoStyleWithSource,
  IRawStylesWithSource,
  ISiteContext,
  StyleSourceType,
} from '@pubstudio/shared/type-site'

export const computeMixinBreakpointStyles = (
  context: ISiteContext,
  mixinIds: string[] | undefined,
  overrideSourceType?: StyleSourceType,
  overrideSourceId?: string,
): IBreakpointStylesWithSource => {
  const result: IBreakpointStylesWithSource = {}

  mixinIds?.forEach((mixinId) => {
    const mixin = resolveStyle(context, mixinId)
    if (mixin) {
      Object.entries(mixin.breakpoints).forEach(([breakpointId, mixinPseudoStyle]) => {
        if (!result[breakpointId]) {
          result[breakpointId] = {}
        }
        const pseudoStyle = result[breakpointId]

        Object.entries(mixinPseudoStyle).forEach(([pseudoClass, mixinRawStyle]) => {
          if (!pseudoStyle[pseudoClass as CssPseudoClassType]) {
            pseudoStyle[pseudoClass as CssPseudoClassType] = {}
          }
          const rawStyle = pseudoStyle[
            pseudoClass as CssPseudoClassType
          ] as IRawStylesWithSource

          Object.entries(mixinRawStyle).forEach(([css, value]) => {
            rawStyle[css as Css] = {
              sourceType: overrideSourceType ?? StyleSourceType.Mixin,
              sourceId: overrideSourceId ?? mixinId,
              sourceBreakpointId: breakpointId,
              value,
            }
          })
        })
      })
    }
  })

  return result
}

export const computePseudoStyleWithSource = (
  componentId: string,
  breakpointId: string,
  pseudo: IPseudoStyle,
  result: IPseudoStyleWithSource,
  overrideSourceType?: StyleSourceType,
) => {
  Object.entries(pseudo).forEach(([pseudoClass, customRawStyle]) => {
    if (!result[pseudoClass as CssPseudoClassType]) {
      result[pseudoClass as CssPseudoClassType] = {}
    }
    const rawStyle = result[pseudoClass as CssPseudoClassType] as IRawStylesWithSource

    Object.entries(customRawStyle).forEach(([css, value]) => {
      rawStyle[css as Css] = {
        // TODO: add style source type for custom component
        sourceType: overrideSourceType ?? StyleSourceType.Custom,
        sourceId: componentId,
        sourceBreakpointId: breakpointId,
        value,
      }
    })
  })
}

export const computeCustomBreakpointStyles = (
  component: IComponent,
  overrideSourceType?: StyleSourceType,
): IBreakpointStylesWithSource => {
  const result: IBreakpointStylesWithSource = {}
  Object.entries(component.style.custom).forEach(([breakpointId, customPseudoStyle]) => {
    if (!result[breakpointId]) {
      result[breakpointId] = {}
    }
    computePseudoStyleWithSource(
      component.id,
      breakpointId,
      customPseudoStyle,
      result[breakpointId],
      overrideSourceType,
    )
  })

  return result
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
        if (!pseudoStyle[pseudoClass as CssPseudoClassType]) {
          pseudoStyle[pseudoClass as CssPseudoClassType] = {}
        }
        const rawStyle = pseudoStyle[
          pseudoClass as CssPseudoClassType
        ] as IRawStylesWithSource

        Object.entries(sourceRawStyle).forEach(([css, source]) => {
          rawStyle[css as Css] = { ...source }
        })
      })
    })
  }

  return result
}
