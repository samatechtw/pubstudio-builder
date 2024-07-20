import {
  computeCustomBreakpointStyles,
  computeMixinBreakpointStyles,
  mergeBreakpointStylesWithSource,
} from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  CssPseudoClassType,
  IBreakpointStylesWithSource,
  IComponent,
  IRawStylesWithSource,
  ISiteContext,
  StyleSourceType,
} from '@pubstudio/shared/type-site'

export const computeComponentBreakpointStyles = (
  context: ISiteContext,
  component: IComponent,
): IBreakpointStylesWithSource => {
  const mixinBreakpointStyles = computeMixinBreakpointStyles(
    context,
    component.style.mixins,
  )

  const customBreakpointStyles = computeCustomBreakpointStyles(component)

  const customCmp = resolveComponent(context, component.customSourceId)
  let customCmpMixinBpStyles: IBreakpointStylesWithSource = {}
  let customCmpCustomBpStyles: IBreakpointStylesWithSource = {}
  if (customCmp) {
    customCmpMixinBpStyles = computeMixinBreakpointStyles(
      context,
      customCmp.style.mixins,
      StyleSourceType.CustomComponent,
      customCmp.id,
    )
    customCmpCustomBpStyles = computeCustomBreakpointStyles(
      customCmp,
      StyleSourceType.CustomComponent,
    )
  }

  // Priority: custom style > mixin > custom component style > custom component mixin
  const mergedBreakpointStylesWithSource = mergeBreakpointStylesWithSource(
    customCmpMixinBpStyles,
    customCmpCustomBpStyles,
    mixinBreakpointStyles,
    customBreakpointStyles,
  )

  return mergedBreakpointStylesWithSource
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
      if (!pseudoStyle[pseudoClass as CssPseudoClassType]) {
        pseudoStyle[pseudoClass as CssPseudoClassType] = {}
      }
      const rawStyle = pseudoStyle[
        pseudoClass as CssPseudoClassType
      ] as IRawStylesWithSource

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
