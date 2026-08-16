import { applyCommand } from '@pubstudio/frontend/data-access-command'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ComponentArgPrimitive,
  Css,
  CssPseudoClass,
  IComponent,
  ISite,
  Tag,
  ThemeFontSource,
} from '@pubstudio/shared/type-site'
import { IOpCtx } from './define-op'

// The mock site has one page, one mixin, one non-root component, and no behaviors, fonts
// or override styles. Ops that need those still have to be exercised, so the fixture
// seeds them up front. The round-trip snapshot is taken after seeding, so it stays an
// exact comparison.
const seedCommands: ICommand[] = [
  {
    type: CommandType.AddStyleMixin,
    data: {
      name: 'Second mixin',
      breakpoints: { [DEFAULT_BREAKPOINT_ID]: { default: { [Css.Margin]: '4px' } } },
    },
  },
  {
    type: CommandType.SetBehavior,
    data: { newBehavior: { name: 'Seed behavior', code: 'return 1' } },
  },
  {
    type: CommandType.AddThemeFont,
    data: { source: ThemeFontSource.Google, name: 'Lato', url: 'https://fonts/lato' },
  },
  {
    type: CommandType.AddPage,
    data: {
      metadata: { route: '/second', name: 'Second', public: true, head: {} },
      activePageRoute: '/home',
    },
  },
  // A sibling so moveComponent has somewhere to go
  {
    type: CommandType.AddComponent,
    data: { tag: Tag.Div, name: 'Sibling', parentId: 'test-c-0' },
  },
  {
    type: CommandType.SetComponentOverrideStyle,
    data: {
      componentId: 'test-c-1',
      selector: '.agent-override',
      breakpointId: DEFAULT_BREAKPOINT_ID,
      newStyle: {
        pseudoClass: CssPseudoClass.Default,
        property: Css.Color,
        value: '#111111',
      },
    },
  },
  {
    type: CommandType.SetComponentInput,
    data: {
      componentId: 'test-c-1',
      newInput: {
        name: 'title',
        type: ComponentArgPrimitive.String,
        attr: true,
        is: 'seed',
      },
    },
  },
  {
    type: CommandType.SetComponentState,
    data: { componentId: 'test-c-1', newKey: 'agentFlag', newVal: false },
  },
  {
    type: CommandType.SetPageHead,
    data: {
      route: '/home',
      tag: 'meta',
      index: 0,
      newValue: { name: 'description', content: 'seed' },
    },
  },
  {
    type: CommandType.SetDefaultsHead,
    data: { tag: 'title', index: 0, newValue: 'Seed title' },
  },
  {
    type: CommandType.SetGlobalStyle,
    data: { name: 'agent-global', newStyle: { style: '.seed { color: red; }' } },
  },
]

export const makeTestSite = (): ISite => {
  const site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
  seedCommands.forEach((command) => applyCommand(site, command))
  // Seeding is fixture setup, not history the round trip should compare
  site.history.back = []
  site.history.forward = []
  return site
}

export const testOpCtx = (site: ISite, warn: (m: string) => void = () => 0): IOpCtx => ({
  site,
  breakpointId: DEFAULT_BREAKPOINT_ID,
  warn,
})

// Key insertion order is not meaningful in the site model, but undo routinely changes it
// (a deleted key is re-added at the end), so compare with keys sorted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stableStringify = (value: any): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

const componentContent = (component: IComponent): unknown => ({
  id: component.id,
  name: component.name,
  tag: component.tag,
  role: component.role,
  content: component.content,
  style: component.style,
  state: component.state,
  inputs: component.inputs,
  events: component.events,
  editorEvents: component.editorEvents,
  customSourceId: component.customSourceId,
  children: component.children?.map(componentContent),
})

// Everything the site publishes. Excludes history and editor state, which undo
// legitimately changes.
export const siteContentSnapshot = (site: ISite): string => {
  const { context, pages, pageOrder, defaults, name, version } = site
  return stableStringify({
    name,
    version,
    defaults,
    pageOrder,
    pages: Object.fromEntries(
      Object.entries(pages).map(([route, page]) => [
        route,
        { ...page, root: componentContent(page.root) },
      ]),
    ),
    context: {
      ...context,
      // Components are compared through the page roots; this map holds parent cycles
      components: Object.keys(context.components).sort(),
      customComponentIds: Array.from(context.customComponentIds).sort(),
      customChildIds: Array.from(context.customChildIds).sort(),
    },
  })
}

// Content plus the builder state an op is allowed to be *about* — changePage moves only
// the active page, and an op that changes nothing at all is a broken example.
export const siteStateSnapshot = (site: ISite): string =>
  `${site.editor?.active}|${siteContentSnapshot(site)}`
