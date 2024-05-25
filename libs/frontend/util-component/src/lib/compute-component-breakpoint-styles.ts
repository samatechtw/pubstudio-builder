import {
  computeCustomBreakpointStyles,
  computeMixinBreakpointStyles,
  mergeBreakpointStylesWithSource,
} from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  CssPseudoClass,
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

  const reusableCmp = resolveComponent(context, component.reusableSourceId)
  let reusableCmpMixinBpStyles: IBreakpointStylesWithSource = {}
  let reusableCmpCustomBpStyles: IBreakpointStylesWithSource = {}
  if (reusableCmp) {
    reusableCmpMixinBpStyles = computeMixinBreakpointStyles(
      context,
      reusableCmp.style.mixins,
      StyleSourceType.ReusableComponent,
      reusableCmp.id,
    )
    reusableCmpCustomBpStyles = computeCustomBreakpointStyles(
      reusableCmp,
      StyleSourceType.ReusableComponent,
    )
  }

  // Priority: custom style > custom mixin > reusable component style > reusable component mixin
  const mergedBreakpointStylesWithSource = mergeBreakpointStylesWithSource(
    reusableCmpMixinBpStyles,
    reusableCmpCustomBpStyles,
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
