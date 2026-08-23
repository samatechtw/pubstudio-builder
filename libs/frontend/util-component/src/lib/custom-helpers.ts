import { isCustomComponentPart, iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IPage, ISite, ISiteContext } from '@pubstudio/shared/type-site'

export { isCustomComponentPart }

// Only ordinary page content converts: not a page root, an instance, or definition content
export const canBecomeCustom = (
  context: ISiteContext,
  componentId: string | undefined,
): boolean => {
  const component = resolveComponent(context, componentId)
  if (!component?.parent) {
    return false
  }
  let cmp: IComponent | undefined = component
  while (cmp) {
    if (cmp.customSourceId || context.customComponentIds.has(cmp.id)) {
      return false
    }
    cmp = cmp.parent
  }
  return true
}

export interface ICustomComponentUsage {
  instances: IComponent[]
  // Page routes with at least one instance
  routes: string[]
}

// Includes instances nested in other definitions, which belong to no page
export const customComponentUsage = (
  site: ISite,
  definitionId: string,
): ICustomComponentUsage => {
  const instances: IComponent[] = []
  const routes: string[] = []
  const collect = (root: IComponent | undefined, route?: string) => {
    let found = false
    iterateComponent(root, (cmp) => {
      if (cmp.customSourceId === definitionId) {
        instances.push(cmp)
        found = true
      }
    })
    if (found && route) {
      routes.push(route)
    }
  }
  for (const route of site.pageOrder) {
    collect(site.pages[route]?.root, route)
  }
  for (const id of site.context.customComponentIds) {
    if (id !== definitionId) {
      collect(site.context.components[id])
    }
  }
  return { instances, routes }
}

// Blocks deleting a page or component that would take a definition with it
export const definitionsInSubtree = (
  context: ISiteContext,
  component: IComponent | undefined,
): string[] => {
  const ids: string[] = []
  iterateComponent(component, (cmp) => {
    if (context.customComponentIds.has(cmp.id)) {
      ids.push(cmp.id)
    }
  })
  return ids
}

export const definitionsInPage = (context: ISiteContext, page: IPage | undefined) =>
  definitionsInSubtree(context, page?.root)
