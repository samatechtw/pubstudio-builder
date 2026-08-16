import { sortedBreakpoints } from '@pubstudio/frontend/feature-site-source'
import { CssPseudoClass } from '@pubstudio/shared/type-site'
import { PSEUDO_CLASSES } from '../schema/fields'
import { describeToc, IDescribeToc } from './describe'
import {
  defaultBreakpointId,
  editingEnabled,
  requireSite,
  saveState,
  siteSource,
  storageKind,
} from './session'

export interface IOrientation {
  siteName: string
  siteId?: string
  siteVersion: string
  editable: boolean
  storage: 'api' | 'local'
  saveState: string
  activePageRoute: string
  selectedComponentId?: string
  homePageRoute: string
  pages: { route: string; name: string; public: boolean }[]
  breakpoints: { id: string; name: string; minWidth?: number; maxWidth?: number }[]
  defaultBreakpointId: string
  pseudoClasses: string[]
  themeVariables: Record<string, string>
  counts: {
    components: number
    mixins: number
    behaviors: number
    customComponents: number
    languages: number
  }
  idConventions: string
  meta?: IDescribeToc
}

export const orientation = (includeMeta = true): IOrientation => {
  const site = requireSite()
  const { context } = site
  return {
    siteName: site.name,
    siteId: siteSource().apiSiteId.value,
    siteVersion: site.version,
    editable: editingEnabled(),
    storage: storageKind(),
    saveState: saveState(),
    activePageRoute: site.editor?.active ?? site.defaults.homePage,
    selectedComponentId: site.editor?.selectedComponent?.id,
    homePageRoute: site.defaults.homePage,
    pages: site.pageOrder.map((route) => ({
      route,
      name: site.pages[route].name,
      public: site.pages[route].public,
    })),
    breakpoints: sortedBreakpoints.value.map((bp) => ({
      id: bp.id,
      name: bp.name,
      minWidth: bp.minWidth,
      maxWidth: bp.maxWidth,
    })),
    defaultBreakpointId: defaultBreakpointId(),
    pseudoClasses: PSEUDO_CLASSES,
    themeVariables: context.theme.variables,
    counts: {
      components: Object.keys(context.components).length,
      mixins: context.styleOrder.length,
      behaviors: Object.keys(context.behaviors).length,
      customComponents: context.customComponentIds.size,
      languages: Object.keys(context.i18n).length,
    },
    idConventions:
      `Ids are namespaced "${context.namespace}-": -c-N components, -s-N mixins, ` +
      `-b-N behaviors, -bp-N breakpoints. Styles cascade from the default breakpoint ` +
      `"${defaultBreakpointId()}" down to smaller ones, and pseudo-class ` +
      `"${CssPseudoClass.Default}" means the unstyled state.`,
    ...(includeMeta ? { meta: describeToc() } : {}),
  }
}
