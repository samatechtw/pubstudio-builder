import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  CssPseudoClass,
  EditorMode,
  ISerializedSite,
  Tag,
} from '@pubstudio/shared/type-site'

export const mockSerializedSite: ISerializedSite = {
  name: 'test',
  version: '2',
  editor: {
    selectedComponentId: 'test-c-0',
    active: '/home',
    mode: EditorMode.SelectedComponent,
    showComponentTree: true,
    componentTreeExpandedItems: {
      'test-c-0': true,
      'test-c-1': false,
    },
    componentTreeRenameData: {
      itemId: undefined,
      renaming: false,
    },
    componentMenuCollapses: {},
    componentsHidden: {},
    componentTab: {},
    styleTab: undefined,
    selectedThemeColors: [],
    builderWidth: 1080,
    builderScale: 1,
    cssPseudoClass: CssPseudoClass.Default,
    hotkeys: {},
    prefs: {
      debugBounding: false,
      overrideOpacity: false,
      overrideTransform: false,
    },
  },
  context: {
    namespace: 'test',
    nextId: 2,
    globalStyles: {},
    styles: {
      'global-s-0': {
        id: 'global-s-0',
        name: 'ContainerVerticalStyle',
        breakpoints: {
          'breakpoint-1': {
            default: {
              display: 'flex',
              'flex-direction': 'column',
            },
          },
        },
      },
    },
    customComponentIds: [],
    customChildIds: [],
    styleOrder: ['global-s-0'],
    behaviors: {},
    theme: {
      variables: {
        'color-title': '#000000',
        'size-title': '40px',
        'color-text': '#1b2125',
        'size-text': '16px',
        'color-link': '#0765d3',
        'color-primary': '#95b1d1',
        'color-secondary': '#1b3858',
        'color-disabled': '#868692',
        'color-border': '#dddfe2',
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
    i18n: { en: { hello: 'My First Blog' } },
  },
  history: {
    back: [
      {
        type: CommandType.AddComponent,
        data: {
          name: 'ContainerHorizontal',
          tag: Tag.Div,
          parentId: 'test-c-0',
          sourceId: 'global-c-containerHorizontal',
          id: 'test-c-1',
        },
      },
    ],
    forward: [],
  },
  defaults: {
    head: {},
    homePage: '/home',
  },
  pages: {
    '/home': {
      name: 'home',
      public: false,
      route: '/home',
      head: {},
      root: {
        id: 'test-c-0',
        name: 'Root',
        tag: Tag.Div,
        children: [
          {
            id: 'test-c-1',
            name: 'ContainerHorizontal',
            tag: Tag.Div,
            parentId: 'test-c-0',
            style: {
              custom: {
                [DEFAULT_BREAKPOINT_ID]: {
                  default: {
                    height: '120px',
                    width: '100%',
                  },
                },
              },
              mixins: ['global-s-0'],
            },
          },
        ],
        style: {
          custom: {
            [DEFAULT_BREAKPOINT_ID]: {
              default: {
                width: '100%',
                height: '100%',
              },
            },
          },
          mixins: ['global-s-0'],
        },
      },
    },
  },
  pageOrder: ['/home'],
}
