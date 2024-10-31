import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { builtinThemeVariables } from '@pubstudio/frontend/util-ids'
import {
  ComponentMenuCollapsible,
  CssPseudoClass,
  EditorMode,
  IEditorContext,
  IPage,
  IPageMetadata,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { createPage, createRootComponent } from './create-util'

export const createEditorContext = (homePage: IPage): IEditorContext => {
  return {
    selectedComponent: homePage.root,
    active: homePage.route,
    editorEvents: {},
    debugBounding: false,
    mode: EditorMode.None,
    editPageRoute: undefined,
    showComponentTree: true,
    componentTab: {},
    componentTreeExpandedItems: {
      [homePage.root.id]: true,
    },
    componentsHidden: {},
    selectedThemeColors: new Set<string>(),
    builderWidth: 1080,
    builderScale: 1,
    cssPseudoClass: CssPseudoClass.Default,
    hotkeys: {},
    componentMenuCollapses: {
      [ComponentMenuCollapsible.Dimensions]: false,
      [ComponentMenuCollapsible.Styles]: false,
      [ComponentMenuCollapsible.ChildStyles]: true,
    },
  }
}

export const makeNamespace = (name: string): string => {
  return name.replace(/[\s#.]/g, '-').toLocaleLowerCase()
}

export const createSite = (_namespace: string): ISite => {
  const namespace = makeNamespace(_namespace)
  // Site context
  const context: ISiteContext = {
    namespace,
    nextId: 0,
    components: {},
    globalStyles: {},
    styles: {},
    styleOrder: [],
    customComponentIds: new Set<string>(),
    customChildIds: new Set<string>(),
    behaviors: {},
    theme: {
      variables: {
        ...builtinThemeVariables,
      },
      fonts: {},
    },
    breakpoints: {
      [DEFAULT_BREAKPOINT_ID]: {
        id: DEFAULT_BREAKPOINT_ID,
        name: 'Desktop (default)',
      },
      'breakpoint-2': {
        id: 'breakpoint-2',
        maxWidth: 980,
        name: 'Tablet (large)',
      },
      'breakpoint-3': {
        id: 'breakpoint-3',
        maxWidth: 760,
        name: 'Tablet (small)',
      },
      'breakpoint-4': {
        id: 'breakpoint-4',
        maxWidth: 480,
        name: 'Mobile',
      },
    },
    i18n: {},
  }

  // Root component
  const root = createRootComponent(namespace, context)
  context.components[root.id] = root

  // Page
  const homePageMetadata: IPageMetadata = {
    name: 'Home',
    public: true,
    route: '/home',
    head: {},
  }
  const homePage = createPage(homePageMetadata, root)

  // Editor context
  const editor = createEditorContext(homePage)

  return {
    context,
    name: namespace,
    version: '0.1',
    defaults: {
      head: {},
      homePage: homePageMetadata.route,
    },
    pages: {
      [homePageMetadata.route]: homePage,
    },
    pageOrder: [homePage.route],
    history: { back: [], forward: [] },
    editor,
  }
}
