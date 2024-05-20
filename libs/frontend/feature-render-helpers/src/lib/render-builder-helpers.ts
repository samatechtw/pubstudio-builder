import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import { Css, IPage, ISite } from '@pubstudio/shared/type-site'
import { computed, Ref } from 'vue'

export interface IUseRenderBuilderHelperOptions {
  site: Ref<ISite | undefined>
  activePage: Ref<IPage | undefined>
}

export interface IUseRenderBuilderHelper {
  rootComponentMinHeight: Ref<string>
}

export const useRenderBuilderHelper = (options: IUseRenderBuilderHelperOptions) => {
  const { site, activePage } = options

  const rootComponentStyle = computed(() => {
    if (!activePage.value || !site.value) {
      return undefined
    }
    return findStyles(
      [Css.Height],
      site.value,
      activePage.value.root,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
  })

  const rootComponentMinHeight = computed(() => {
    const { height } = rootComponentStyle.value ?? {}
    if (!height || height === '100%') {
      return '100%'
    } else {
      return 'auto'
    }
  })

  return {
    rootComponentMinHeight,
  }
}
