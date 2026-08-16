import { builtinBehaviors, builtinComponents } from '@pubstudio/frontend/util-builtin'
import {
  computeComponentBreakpointStyles,
  computeFlattenedStyles,
} from '@pubstudio/frontend/util-component'
import { descSortedBreakpoints } from '@pubstudio/frontend/feature-site-source'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { CommandType } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import {
  mustResolveBreakpoint,
  mustResolveComponent,
  mustResolveMixin,
  mustResolvePage,
} from '../op/op-helpers'
import { AgentError } from '../result'
import { orientation } from '../tools/orientation'
import {
  COMPONENT_INCLUDES,
  ComponentInclude,
  componentSummary,
  componentTree,
  componentView,
  IComponentMatch,
  mixinSummary,
} from './serialize'

export interface IReadInput {
  site?: boolean
  tree?: { page?: string; componentId?: string; depth?: number }
  components?: string[]
  include?: ComponentInclude[]
  styles?: { componentId: string; breakpointId?: string; resolved?: boolean }
  find?: { tag?: string; name?: string; text?: string; hasMixin?: string; page?: string }
  mixins?: boolean | string[]
  theme?: boolean
  behaviors?: boolean | string[]
  i18n?: boolean | string[]
  head?: { page?: string }
  builtins?: boolean
  html?: { componentId: string }
  history?: { n?: number }
}

const DEFAULT_TREE_DEPTH = 4
const MAX_COMPONENTS = 25

const iterate = (component: IComponent, fn: (c: IComponent) => void) => {
  fn(component)
  component.children?.forEach((child) => iterate(child, fn))
}

const readTree = (site: ISite, input: NonNullable<IReadInput['tree']>) => {
  const root = input.componentId
    ? mustResolveComponent(site, input.componentId)
    : mustResolvePage(site, input.page ?? activeRoute(site)).root
  return componentTree(root, input.depth ?? DEFAULT_TREE_DEPTH)
}

const activeRoute = (site: ISite): string => site.editor?.active ?? site.defaults.homePage

const readComponents = (
  site: ISite,
  ids: string[],
  include: ComponentInclude[] | undefined,
) => {
  if (ids.length > MAX_COMPONENTS) {
    throw new AgentError(
      'TOO_LARGE',
      `components takes at most ${MAX_COMPONENTS} ids per call; got ${ids.length}.`,
    )
  }
  const fields = include ?? ['style', 'inputs', 'events']
  const unknown = fields.filter((field) => !COMPONENT_INCLUDES.includes(field))
  if (unknown.length) {
    throw new AgentError(
      'INVALID_INPUT',
      `Unknown include: ${unknown.join(', ')}. Valid: ${COMPONENT_INCLUDES.join(', ')}.`,
    )
  }
  return ids.map((id) => componentView(mustResolveComponent(site, id), fields))
}

const readStyles = (site: ISite, input: NonNullable<IReadInput['styles']>) => {
  const component = mustResolveComponent(site, input.componentId)
  if (!input.resolved) {
    return {
      componentId: component.id,
      mixins: component.style.mixins,
      custom: input.breakpointId
        ? { [input.breakpointId]: component.style.custom[input.breakpointId] }
        : component.style.custom,
      overrides: component.style.overrides,
    }
  }
  const breakpoint = input.breakpointId
    ? mustResolveBreakpoint(site, input.breakpointId)
    : descSortedBreakpoints.value[0]
  const breakpointStyles = computeComponentBreakpointStyles(site.context, component)
  return {
    componentId: component.id,
    breakpointId: breakpoint.id,
    // Each value carries the mixin or breakpoint it came from, so an agent can see
    // which rule it is fighting before overriding one
    effective: computeFlattenedStyles(
      site.editor,
      breakpointStyles,
      descSortedBreakpoints.value,
      breakpoint,
      true,
    ),
    byBreakpoint: breakpointStyles,
  }
}

const readFind = (site: ISite, input: NonNullable<IReadInput['find']>) => {
  const matches: IComponentMatch[] = []
  const text = input.text?.toLowerCase()
  const name = input.name?.toLowerCase()
  const routes = input.page ? [input.page] : site.pageOrder
  for (const route of routes) {
    const page = mustResolvePage(site, route)
    iterate(page.root, (component) => {
      if (input.tag && component.tag !== input.tag) return
      if (name && !component.name?.toLowerCase().includes(name)) return
      if (text && !component.content?.toLowerCase().includes(text)) return
      if (input.hasMixin && !component.style.mixins?.includes(input.hasMixin)) return
      matches.push(componentSummary(component, route))
    })
  }
  return { matches, count: matches.length }
}

const readHistory = (site: ISite, n: number) => {
  const entries = site.history.back.slice(-n).reverse()
  return {
    depth: site.history.back.length,
    redoDepth: site.history.forward.length,
    recent: entries.map((command) => ({
      type: command.type,
      commands:
        command.type === CommandType.Group
          ? (command.data as ICommandGroupData).commands.map((c) => c.type)
          : undefined,
    })),
  }
}

const readHtml = (componentId: string) => {
  const element = document.getElementById(componentId)
  if (!element) {
    throw new AgentError(
      'NOT_FOUND',
      `${componentId} is not rendered on the builder canvas. It may be on another page — ` +
        'switch with apply({ops:[{op:"changePage",…}]}).',
    )
  }
  return { componentId, html: element.outerHTML }
}

export const read = (site: ISite, input: IReadInput): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  if (input.site) {
    result.site = orientation(false)
  }
  if (input.tree) {
    result.tree = readTree(site, input.tree)
  }
  if (input.components) {
    result.components = readComponents(site, input.components, input.include)
  }
  if (input.styles) {
    result.styles = readStyles(site, input.styles)
  }
  if (input.find) {
    result.find = readFind(site, input.find)
  }
  if (input.mixins) {
    const ids = Array.isArray(input.mixins) ? input.mixins : undefined
    result.mixins = ids
      ? ids.map((id) => mustResolveMixin(site, id))
      : site.context.styleOrder.map((id) => mixinSummary(site.context.styles[id]))
  }
  if (input.theme) {
    const variables = site.context.theme.variables
    result.theme = {
      variables,
      resolved: Object.fromEntries(
        Object.entries(variables).map(([key, value]) => [
          key,
          resolveThemeVariables(site.context, value) ?? value,
        ]),
      ),
      fonts: site.context.theme.fonts,
      syntax: 'Reference a variable from any style value as ${name}.',
    }
  }
  if (input.behaviors) {
    const ids = Array.isArray(input.behaviors) ? input.behaviors : undefined
    result.behaviors = ids
      ? ids.map((id) => site.context.behaviors[id])
      : Object.values(site.context.behaviors).map((b) => ({
          id: b.id,
          name: b.name,
          args: b.args ? Object.keys(b.args) : undefined,
        }))
  }
  if (input.i18n) {
    const codes = Array.isArray(input.i18n) ? input.i18n : undefined
    result.i18n = codes
      ? Object.fromEntries(codes.map((code) => [code, site.context.i18n[code]]))
      : {
          languages: Object.keys(site.context.i18n),
          active: site.context.activeI18n,
          keyCounts: Object.fromEntries(
            Object.entries(site.context.i18n).map(([code, t]) => [
              code,
              Object.keys(t).length,
            ]),
          ),
        }
  }
  if (input.head) {
    const route = input.head.page ?? activeRoute(site)
    result.head = {
      route,
      page: mustResolvePage(site, route).head,
      siteDefaults: site.defaults.head,
    }
  }
  if (input.builtins) {
    result.builtins = {
      components: Object.values(builtinComponents).map((c) => ({
        sourceId: c.id,
        name: c.name,
        tag: c.tag,
      })),
      behaviors: Object.values(builtinBehaviors).map((b) => ({
        behaviorId: b.id,
        name: b.name,
        args: b.args ? Object.keys(b.args) : undefined,
      })),
      usage: 'Pass a component sourceId to addComponent({sourceId}).',
    }
  }
  if (input.html) {
    result.html = readHtml(input.html.componentId)
  }
  if (input.history) {
    result.history = readHistory(site, input.history.n ?? 10)
  }
  if (!Object.keys(result).length) {
    throw new AgentError(
      'INVALID_INPUT',
      'read() needs a selector. See describe() for the list, or start with read({site:true}).',
    )
  }
  return result
}
