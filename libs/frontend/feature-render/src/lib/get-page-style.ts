import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import {
  computeComponentBreakpointStyles,
  computeComponentFlattenedStyles,
  computeComponentOverrideStyle,
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

type ComponentIterFn = (component: IComponent) => void

const iteratePage = (page: IPage, fn: ComponentIterFn) => {
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

  const appendStyle = (component: IComponent) => {
    const breakpointStyles = computeComponentBreakpointStyles(site.context, component, {
      // Ignore mixins because they're already handled by Reusable Styles in renderer.
      computeMixins: false,
    })
    const flattenedStyles = computeComponentFlattenedStyles(
      site.editor,
      breakpointStyles,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
    const resolvedStyle = rawStyleToResolvedStyleWithSource(site.context, flattenedStyles)
    pageStyle[`#${component.id}`] = resolvedStyle

    if (component.style.overrides) {
      Object.keys(component.style.overrides).forEach((selector) => {
        const childStyles = computeComponentOverrideStyle(component, selector)
        const childFlattened = computeComponentFlattenedStyles(
          site.editor,
          childStyles,
          descSortedBreakpoints.value,
          activeBreakpoint.value,
        )
        const childResolved = rawStyleToResolvedStyleWithSource(
          site.context,
          childFlattened,
        )
        pageStyle[`#${component.id} #${selector}`] = childResolved
      })
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
          queryStyle[breakpointId][`#${component.id}${pseudoValue}`] = resolvedStyle
        })
      }
      if (overrideStyles && overrideStyles[breakpointId]) {
        Object.entries(overrideStyles[breakpointId]).forEach(
          ([selector, selectorStyles]) => {
            Object.entries(selectorStyles).forEach(([pseudoClass, rawStyle]) => {
              const pseudoValue =
                pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
              const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
              queryStyle[breakpointId][`#${component.id}${pseudoValue} #${selector}`] =
                resolvedStyle
            })
          },
        )
      }
    }
  }
  iteratePage(page, appendStyle)

  return queryStyle
}
