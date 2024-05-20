import { resolveStyle } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  CssPseudoClass,
  IBreakpointOverrideStylesWithSource,
  IBreakpointStylesWithSource,
  IComponent,
  IPseudoStyle,
  IPseudoStyleWithSource,
  IRawStylesWithSource,
  ISiteContext,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { mergeBreakpointStylesWithSource } from './merge-styles'

export interface IComputeComponentBreakpointStylesOptions {
  /**
   * @default true
   */
  computeMixins?: boolean
  /**
   * @default false
   */
  computeOverrides?: boolean
}

export const computeComponentBreakpointStyles = (
  context: ISiteContext,
  component: IComponent,
  options?: IComputeComponentBreakpointStylesOptions,
): IBreakpointStylesWithSource => {
  const { computeMixins = true } = options ?? {}

  let mixinBreakpointStyles: IBreakpointStylesWithSource = {}
  if (computeMixins) {
    mixinBreakpointStyles = computeMixinBreakpointStyles(context, component.style.mixins)
  }

  const customBreakpointStyles = computeCustomBreakpointStyles(component)

  // Priority: custom style > mixin
  const mergedBreakpointStylesWithSource = mergeBreakpointStylesWithSource(
    mixinBreakpointStyles,
    customBreakpointStyles,
  )

  return mergedBreakpointStylesWithSource
}

const computeMixinBreakpointStyles = (
  context: ISiteContext,
  mixinIds: string[] | undefined,
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
          if (!pseudoStyle[pseudoClass as CssPseudoClass]) {
            pseudoStyle[pseudoClass as CssPseudoClass] = {}
          }
          const rawStyle = pseudoStyle[
            pseudoClass as CssPseudoClass
          ] as IRawStylesWithSource

          Object.entries(mixinRawStyle).forEach(([css, value]) => {
            rawStyle[css as Css] = {
              sourceType: StyleSourceType.Mixin,
              sourceId: mixinId,
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

const computePseudoStyleWithSource = (
  componentId: string,
  breakpointId: string,
  pseudo: IPseudoStyle,
  result: IPseudoStyleWithSource,
) => {
  Object.entries(pseudo).forEach(([pseudoClass, customRawStyle]) => {
    if (!result[pseudoClass as CssPseudoClass]) {
      result[pseudoClass as CssPseudoClass] = {}
    }
    const rawStyle = result[pseudoClass as CssPseudoClass] as IRawStylesWithSource

    Object.entries(customRawStyle).forEach(([css, value]) => {
      rawStyle[css as Css] = {
        sourceType: StyleSourceType.Custom,
        sourceId: componentId,
        sourceBreakpointId: breakpointId,
        value,
      }
    })
  })
}

const computeCustomBreakpointStyles = (
  component: IComponent,
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
    )
  })

  return result
}

export const computeComponentOverrideStyle = (
  component: IComponent,
  selector: string,
): IBreakpointStylesWithSource => {
  const result: IBreakpointStylesWithSource = {}
  const styles = component.style.overrides?.[selector]
  if (!styles) {
    return result
  }

  Object.entries(styles).forEach(([breakpointId, customPseudoStyle]) => {
    if (!result[breakpointId]) {
      result[breakpointId] = {}
    }
    const pseudoStyle = result[breakpointId]

    Object.entries(customPseudoStyle).forEach(([pseudoClass, customRawStyle]) => {
      if (!pseudoStyle[pseudoClass as CssPseudoClass]) {
        pseudoStyle[pseudoClass as CssPseudoClass] = {}
      }
      const rawStyle = pseudoStyle[pseudoClass as CssPseudoClass] as IRawStylesWithSource

      Object.entries(customRawStyle).forEach(([css, value]) => {
        rawStyle[css as Css] = {
          sourceType: StyleSourceType.Custom,
          sourceId: component.id,
          sourceBreakpointId: breakpointId,
          value,
        }
      })
    })
  })

  return result
}

export const computeComponentOverrideStyles = (
  component: IComponent,
): IBreakpointOverrideStylesWithSource | undefined => {
  if (!component.style.overrides) {
    return undefined
  }
  const result: IBreakpointOverrideStylesWithSource = {}
  Object.entries(component.style.overrides).forEach(([selector, breakpointStyles]) => {
    Object.entries(breakpointStyles).forEach(([breakpointId, pseudoStyle]) => {
      if (!result[breakpointId]) {
        result[breakpointId] = {}
      }
      if (!result[breakpointId][selector]) {
        result[breakpointId][selector] = {}
      }
      computePseudoStyleWithSource(
        component.id,
        breakpointId,
        pseudoStyle,
        result[breakpointId][selector],
      )
    })
  })
  return result
}
