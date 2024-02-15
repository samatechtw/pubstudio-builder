import { getActiveBreakpointIds } from '@pubstudio/frontend/feature-site-source'
import {
  computeComponentBreakpointStyles,
  computeComponentOverrideStyles,
} from '@pubstudio/frontend/util-component'
import {
  createQueryStyle,
  IQueryStyle,
  IRawStyleRecord,
  rawStyleToResolvedStyleWithSource,
} from '@pubstudio/frontend/util-render'
import {
  Css,
  CssPseudoClass,
  IComponent,
  IPage,
  IRawStyle,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { pseudoClassToCssClass } from './pseudo-class-to-css-class'
import { sanitizeCssClass } from './sanitize-css-class'

type ComponentIterFn = (component: IComponent) => void

export const iteratePage = (page: IPage, fn: ComponentIterFn) => {
  // Tree iteration
  const stack = [page.root]
  while (stack.length > 0) {
    const cmp = stack.pop()
    fn(cmp as IComponent)
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
}

export const getBuildPageStyle = (site: ISite, page: IPage): IRawStyleRecord => {
  const pageStyle: IRawStyleRecord = {}
  const accumulatedBreakpointIds = getActiveBreakpointIds()

  const appendStyle = (component: IComponent) => {
    const componentSelector = sanitizeCssClass(component.id)
    const currentPseudoClass = site.editor?.cssPseudoClass ?? CssPseudoClass.Default

    // Compute styles in default pseudo class
    accumulatedBreakpointIds.forEach((breakpointId) => {
      const bpStyle = component.style.custom[breakpointId]
      const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
      const cls = `.${componentSelector}`
      const style = pageStyle[cls] ?? {}
      pageStyle[cls] = { ...style, ...rawStyle }

      // Compute styles in the default and current pseudo class
      if (currentPseudoClass !== CssPseudoClass.Default) {
        const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
        const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)
        const cls = `.${componentSelector}.${pseudoClassName}`
        const style = pageStyle[cls] ?? {}
        pageStyle[cls] = { ...style, ...rawStyle }
      }
    })

    if (component.style.overrides) {
      Object.entries(component.style.overrides).forEach(
        ([selector, breakpointStyles]) => {
          const overrideSelector = sanitizeCssClass(selector)
          // Compute styles in default pseudo class
          accumulatedBreakpointIds.forEach((breakpointId) => {
            const bpStyle = breakpointStyles[breakpointId]
            const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
            pageStyle[`.${componentSelector} .${overrideSelector}`] = { ...rawStyle }

            // Compute styles in the current pseudo class
            if (currentPseudoClass !== CssPseudoClass.Default) {
              const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
              const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)
              pageStyle[`.${componentSelector} .${overrideSelector}.${pseudoClassName}`] =
                {
                  ...rawStyle,
                }
            }
          })
        },
      )
    }
  }
  iteratePage(page, appendStyle)

  return pageStyle
}

export const getRootBackgroundStyle = (
  context: ISiteContext,
  page: IPage,
): IQueryStyle => {
  const queryStyle = createQueryStyle(context)
  const breakpointStyles = computeComponentBreakpointStyles(context, page.root, {
    computeMixins: true,
  })
  for (const breakpointId in context.breakpoints) {
    const pseudoStyle = breakpointStyles[breakpointId]
    if (pseudoStyle) {
      Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
        const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
        const filteredStyle: IRawStyle = {}
        if (resolvedStyle[Css.Background]) {
          filteredStyle[Css.Background] = resolvedStyle[Css.Background]
        }
        if (resolvedStyle[Css.BackgroundColor]) {
          filteredStyle[Css.BackgroundColor] = resolvedStyle[Css.BackgroundColor]
        }
        const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
        queryStyle[breakpointId][`html${pseudoValue}`] = filteredStyle
      })
    }
  }
  return queryStyle
}

export const getLivePageStyle = (context: ISiteContext, page: IPage): IQueryStyle => {
  const queryStyle = createQueryStyle(context)

  const appendStyle = (component: IComponent) => {
    const componentSelector = sanitizeCssClass(component.id)
    const breakpointStyles = computeComponentBreakpointStyles(context, component, {
      // Ignore mixins because they're already handled by Reusable Styles in renderer.
      computeMixins: false,
    })
    const overrideStyles = computeComponentOverrideStyles(component)
    for (const breakpointId in context.breakpoints) {
      const pseudoStyle = breakpointStyles[breakpointId]
      if (pseudoStyle) {
        Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
          const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
          const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
          queryStyle[breakpointId][`.${componentSelector}${pseudoValue}`] = resolvedStyle
        })
      }
      if (overrideStyles && overrideStyles[breakpointId]) {
        Object.entries(overrideStyles[breakpointId]).forEach(
          ([selector, selectorStyles]) => {
            const overrideSelector = sanitizeCssClass(selector)
            Object.entries(selectorStyles).forEach(([pseudoClass, rawStyle]) => {
              const pseudoValue =
                pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
              const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
              queryStyle[breakpointId][
                `.${componentSelector}${pseudoValue} .${overrideSelector}`
              ] = resolvedStyle
            })
          },
        )
      }
    }
  }
  iteratePage(page, appendStyle)

  return queryStyle
}
