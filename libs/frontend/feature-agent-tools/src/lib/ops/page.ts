import { makeSetPageHeadData, pageHeadValue } from '@pubstudio/frontend/util-command-data'
import { serializePage } from '@pubstudio/frontend/util-site-store'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddPageData,
  IChangePageData,
  IEditPageData,
  IRemovePageData,
  ISetHomePageData,
  ISetPageHeadData,
} from '@pubstudio/shared/type-command-data'
import { IHeadObject, IPageHeadTag, IPageMetadata } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint, examplePageRoute, mustResolvePage } from '../op/op-helpers'
import { routeField } from '../schema/fields'
import { bool, json, num, obj, oneOf, str } from '../schema/schema'

const PAGE_HEAD_TAGS: IPageHeadTag[] = ['title', 'meta', 'link', 'script']

export const addPageOp = defineOp<IAddPageData>()({
  name: 'addPage',
  command: CommandType.AddPage,
  title: 'Add page',
  description:
    'Create a page with an empty root component. Pass `copyFromRoute` to start from a ' +
    'copy of an existing page’s content instead. The builder switches to the new page.',
  input: obj({
    route: routeField().desc('New page route, starting with "/".'),
    name: str().desc('Page name shown in the builder.'),
    public: bool().dflt(true).desc('Whether the page is included when published.'),
    copyFromRoute: str()
      .optional()
      .desc('Route of a page whose content should be copied into the new page.'),
  }),
  derived: ['metadata', 'root', 'activePageRoute', 'selectedComponentId'],
  omitted: {},
  resolve: (ctx, input) => {
    if (ctx.site.pages[input.route]) {
      constraint(`A page with route "${input.route}" already exists.`)
    }
    if (!input.route.startsWith('/')) {
      constraint('route must start with "/".')
    }
    const metadata: IPageMetadata = {
      route: input.route,
      name: input.name,
      public: input.public ?? true,
      head: {},
    }
    const copyFrom = input.copyFromRoute
      ? mustResolvePage(ctx.site, input.copyFromRoute)
      : undefined
    const data: IAddPageData = {
      metadata,
      activePageRoute: ctx.site.editor?.active ?? ctx.site.defaults.homePage,
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
      root: copyFrom
        ? {
            name: copyFrom.root.name,
            tag: copyFrom.root.tag,
            parentId: '',
            sourceId: copyFrom.root.id,
          }
        : undefined,
    }
    return { type: CommandType.AddPage, data }
  },
  example: () => ({ route: '/agent-page', name: 'Agent page' }),
})

export const editPageOp = defineOp<IEditPageData>()({
  name: 'editPage',
  command: CommandType.EditPage,
  title: 'Edit page',
  description:
    'Change a page’s route, name or public flag, and/or move it in the page order. ' +
    'Changing the route updates the home page reference when it points at this page.',
  input: obj({
    route: routeField().desc('Current route of the page to edit.'),
    newRoute: str().optional().desc('New route, starting with "/".'),
    name: str().optional().desc('New page name.'),
    public: bool().optional().desc('New public flag.'),
    index: num().optional().desc('New position in the page order, starting at 0.'),
  }),
  derived: ['oldMetadata', 'newMetadata', 'order'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    if (input.newRoute && ctx.site.pages[input.newRoute]) {
      constraint(`A page with route "${input.newRoute}" already exists.`)
    }
    const oldMetadata: IPageMetadata = {
      route: page.route,
      name: page.name,
      public: page.public,
      head: structuredClone(page.head),
    }
    const data: IEditPageData = {
      oldMetadata,
      newMetadata: {
        ...oldMetadata,
        route: input.newRoute ?? page.route,
        name: input.name ?? page.name,
        public: input.public ?? page.public,
      },
    }
    if (input.index !== undefined) {
      const pos = ctx.site.pageOrder.indexOf(page.route)
      if (input.index < 0 || input.index >= ctx.site.pageOrder.length) {
        constraint(`index must be between 0 and ${ctx.site.pageOrder.length - 1}.`)
      }
      data.order = { pos, newPos: input.index }
    }
    return { type: CommandType.EditPage, data }
  },
  example: (site) => ({ route: examplePageRoute(site), name: 'Renamed page' }),
})

export const removePageOp = defineOp<IRemovePageData>()({
  name: 'removePage',
  command: CommandType.RemovePage,
  title: 'Remove page',
  description:
    'Delete a page and its component tree. The last remaining page cannot be removed, ' +
    'and neither can the home page — point setHomePage elsewhere first.',
  input: obj({ route: routeField() }),
  derived: ['pageRoute', 'orderIndex', 'serializedPage', 'selectedComponentId'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    if (Object.keys(ctx.site.pages).length < 2) {
      constraint('A site must have at least one page.')
    }
    if (ctx.site.defaults.homePage === page.route) {
      constraint(`${page.route} is the home page; call setHomePage first.`)
    }
    const data: IRemovePageData = {
      pageRoute: page.route,
      orderIndex: ctx.site.pageOrder.indexOf(page.route),
      serializedPage: serializePage(page),
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
    }
    return { type: CommandType.RemovePage, data }
  },
  example: (site) => ({
    route: site.pageOrder.find((route) => route !== site.defaults.homePage) as string,
  }),
})

export const changePageOp = defineOp<IChangePageData>()({
  name: 'changePage',
  command: CommandType.ChangePage,
  title: 'Show a page in the builder',
  description:
    'Switch the builder canvas to another page. Site content is unchanged; do this before ' +
    'taking a screenshot or reading rendered HTML for that page.',
  input: obj({ route: routeField() }),
  derived: ['from', 'to', 'selectedComponentId'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    const from = ctx.site.editor?.active ?? ctx.site.defaults.homePage
    if (from === page.route) {
      ctx.warn(`${page.route} is already the active page`)
      return []
    }
    const data: IChangePageData = {
      from,
      to: page.route,
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
    }
    return { type: CommandType.ChangePage, data }
  },
  example: (site) => ({
    route: site.pageOrder.find((route) => route !== site.editor?.active) as string,
  }),
})

export const setHomePageOp = defineOp<ISetHomePageData>()({
  name: 'setHomePage',
  command: CommandType.SetHomePage,
  title: 'Set home page',
  description:
    'Make a page the site’s home page. It also moves to the front of the page order.',
  input: obj({ route: routeField() }),
  derived: ['oldRoute', 'newRoute', 'oldPos'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    if (ctx.site.defaults.homePage === page.route) {
      ctx.warn(`${page.route} is already the home page`)
      return []
    }
    const data: ISetHomePageData = {
      oldRoute: ctx.site.defaults.homePage,
      newRoute: page.route,
      oldPos: ctx.site.pageOrder.indexOf(page.route),
    }
    return { type: CommandType.SetHomePage, data }
  },
  example: (site) => ({
    route: site.pageOrder.find((route) => route !== site.defaults.homePage) as string,
  }),
})

export const setPageHeadOp = defineOp<ISetPageHeadData>()({
  name: 'setPageHead',
  command: CommandType.SetPageHead,
  title: 'Set page head tag',
  description:
    'Add, replace or remove an entry in a page’s <head>. `title` is a plain string at ' +
    'index 0; meta, link and script are lists — omit `index` to append, or pass one to ' +
    'replace. Omit `value` to remove the entry at `index`.',
  input: obj({
    route: routeField(),
    tag: oneOf(PAGE_HEAD_TAGS).desc('Head tag to write.'),
    value: json()
      .optional()
      .desc(
        'String for `title`; an object for the others, e.g. {"name":"description",' +
          '"content":"…"} or {"rel":"canonical","href":"…"}. Omit to remove.',
      ),
    index: num().optional().desc('Entry index. Appends when omitted.'),
  }),
  derived: ['oldValue', 'newValue'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    const index = input.tag === 'title' ? 0 : input.index
    if (input.value === undefined) {
      if (
        index === undefined ||
        pageHeadValue(ctx.site, page.route, input.tag, index) === undefined
      ) {
        constraint(`${page.route} has no ${input.tag} entry at index ${index ?? 0}.`)
      }
    }
    return {
      type: CommandType.SetPageHead,
      data: makeSetPageHeadData(
        ctx.site,
        page.route,
        input.tag,
        index,
        input.value as IHeadObject | undefined,
      ),
    }
  },
  example: (site) => ({
    route: examplePageRoute(site),
    tag: 'meta' as IPageHeadTag,
    value: { name: 'description', content: 'Set by agent' },
  }),
})
