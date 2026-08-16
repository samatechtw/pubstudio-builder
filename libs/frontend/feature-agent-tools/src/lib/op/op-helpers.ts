import {
  resolveBehavior,
  resolveComponent,
  resolveStyle,
} from '@pubstudio/frontend/util-resolve'
import {
  IBehavior,
  IBreakpoint,
  IComponent,
  IPage,
  ISite,
  IStyle,
} from '@pubstudio/shared/type-site'
import { AgentError } from '../result'

export const mustResolveComponent = (site: ISite, id: string): IComponent => {
  const component = resolveComponent(site.context, id)
  if (!component) {
    throw new AgentError(
      'NOT_FOUND',
      `No component "${id}". List valid ids with read({tree:{}}).`,
    )
  }
  return component
}

export const mustResolveMixin = (site: ISite, id: string): IStyle => {
  const mixin = resolveStyle(site.context, id)
  if (!mixin) {
    throw new AgentError(
      'NOT_FOUND',
      `No style mixin "${id}". List valid ids with read({mixins:true}).`,
    )
  }
  return mixin
}

export const mustResolveBehavior = (site: ISite, id: string): IBehavior => {
  const behavior = resolveBehavior(site.context, id)
  if (!behavior) {
    throw new AgentError(
      'NOT_FOUND',
      `No behavior "${id}". List valid ids with read({behaviors:true}).`,
    )
  }
  return behavior
}

export const mustResolvePage = (site: ISite, route: string): IPage => {
  const page = site.pages[route]
  if (!page) {
    throw new AgentError(
      'NOT_FOUND',
      `No page with route "${route}". List routes with read({site:true}).`,
    )
  }
  return page
}

export const mustResolveBreakpoint = (site: ISite, id: string): IBreakpoint => {
  const breakpoint = site.context.breakpoints[id]
  if (!breakpoint) {
    throw new AgentError(
      'NOT_FOUND',
      `No breakpoint "${id}". List breakpoints with read({site:true}).`,
    )
  }
  return breakpoint
}

// Explicitly typed so TypeScript narrows control flow after a call
export const constraint: (message: string) => never = (message) => {
  throw new AgentError('CONSTRAINT', message)
}

// First component that is not a page root, for op examples against a mock site
export const exampleComponentId = (site: ISite): string => {
  const roots = new Set(Object.values(site.pages).map((page) => page.root.id))
  const id = Object.keys(site.context.components).find((key) => !roots.has(key))
  return id ?? Object.keys(site.context.components)[0]
}

export const examplePageRoute = (site: ISite): string =>
  site.defaults.homePage ?? site.pageOrder[0]
