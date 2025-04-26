import { App, computed, markRaw, nextTick, Plugin, Ref, ref } from 'vue'
import { RouterLink } from '../components/RouterLink'
import { RouterView } from '../components/RouterView'
import { RouterNavigationType } from './enum-router-navigation-type'
import { ILocationParts } from './i-location-parts'
import {
  AnyComponent,
  IResolvedRoute,
  IRouteWithComponent,
  IRouteWithPathRegex,
  ScrollType,
} from './i-route'
import {
  IDefaultRouteType,
  INavGuardCallback,
  INavigateOptions,
  IResolveRouteOptions,
  IRouter,
  PathTransform,
} from './i-router'
import { RouteLevelSymbol, RouterSymbol } from './router-injection-keys'
import {
  computeLocationParts,
  computePathRegex,
  computeResolvedPath,
  getCurrentPath,
  matchRoute,
  mergePath,
  replaceParams,
  validateRoute,
} from './router-util'
import {
  _ScrollPositionNormalized,
  computeScrollPosition,
  getSavedScrollPosition,
  getScrollKey,
  saveScrollPosition,
  ScrollPosition,
  scrollToPosition,
  waitForRender,
} from './scroll-behavior'

export interface RouterScrollBehavior<M> {
  /**
   * @param to - Route we are navigating to
   * @param from - Route we are navigating from
   * @param savedPosition - saved position if it exists, `null` otherwise
   */
  (
    to: IResolvedRoute<M> | undefined,
    from: IResolvedRoute<M> | undefined,
    savedPosition: _ScrollPositionNormalized | null,
  ): Awaitable<ScrollPosition | false | void>
}

type Awaitable<T> = T | Promise<T>

export interface ICreateRouterOptions<M> {
  routes: IRouteWithComponent<M>[]
  scrollBehavior?: RouterScrollBehavior<M>
  scrollRoot?: string
  defaultScrollType?: ScrollType
  pathTransform?: PathTransform
}

export const createRouter = <M = IDefaultRouteType>(
  options: ICreateRouterOptions<M>,
): Plugin & IRouter<M> => {
  const {
    routes: routesOption,
    scrollBehavior,
    scrollRoot = 'html',
    defaultScrollType,
    pathTransform = (p) => p,
  } = options

  const rootRoutes = ref([]) as Ref<IRouteWithPathRegex<M>[]>
  const matchedRoutes = ref([]) as Ref<IResolvedRoute<M>[]>

  const beforeEachHooks = new Set<INavGuardCallback<M>>()
  const afterEachHooks = new Set<INavGuardCallback<M>>()

  const routesMetadata = computed(() => {
    const usedRegex = new Set<string>()
    // key: route name, value: route
    const routesMap = new Map<string, IRouteWithPathRegex<M>>()

    let rootDefaultRoute: IRouteWithPathRegex<M> | undefined
    let notFoundRoute: IRouteWithPathRegex<M> | undefined

    const recurse = (
      route: IRouteWithPathRegex<M>,
      parentRoute: IRouteWithPathRegex<M> | undefined,
    ) => {
      usedRegex.add(route.mergedPathRegex.source)
      routesMap.set(route.name, route)

      if (route.path === '/' && !parentRoute) {
        rootDefaultRoute = route
      }
      if (route.isNotFoundRoute) {
        notFoundRoute = route
      }

      route.children?.forEach((child) => recurse(child, route))
    }

    rootRoutes.value.forEach((rootRoute) => recurse(rootRoute, undefined))

    return {
      usedRegex,
      routesMap,
      rootDefaultRoute,
      notFoundRoute,
    }
  })

  const addRoute = (routeProp: IRouteWithComponent<M>): IRouteWithPathRegex<M> => {
    // Declare recurse function
    const recurse = (
      route: IRouteWithComponent<M>,
      parentRoute: IRouteWithComponent<M> | undefined,
      cumulativePath: string,
    ): IRouteWithPathRegex<M> => {
      const { usedRegex, routesMap, notFoundRoute } = routesMetadata.value

      validateRoute(route)

      // Merge route path with parent path
      const mergedPath = mergePath(cumulativePath, route.path)
      const mergedPathRegex = computePathRegex(mergedPath)
      let routeWithSameName = undefined
      if (route.name) {
        routeWithSameName = routesMap.get(route.name)
      }

      // Make sure route name and route path are unique
      if (routeWithSameName) {
        throw new Error(`Named route exists: ${route.name}`)
      } else if (usedRegex.has(mergedPathRegex.source)) {
        throw new Error(`Already matched route path: ${mergedPath}`)
      } else if (mergedPath === '/' && parentRoute) {
        throw new Error('Default route cannot be a child')
      } else if (route.isNotFoundRoute) {
        if (parentRoute) {
          throw new Error('Not found cannot be a child')
        } else if (route.children?.length) {
          throw new Error('Not found cannot have children')
        } else if (notFoundRoute) {
          throw new Error(`Not found route exists: ${notFoundRoute.name}`)
        }
      }

      return {
        name: route.name,
        path: route.path,
        alias: route.alias,
        meta: route.meta,
        // Use `markRaw` here to get rid of "Vue received a Component which was made a reactive object" warning.
        component: markRaw(route.component),
        isNotFoundRoute: route.isNotFoundRoute,
        scrollType: route.scrollType,
        mergedPath,
        mergedPathRegex,
        children: route.children?.map((child) => recurse(child, route, mergedPath)),
      }
    }

    // Add route
    const rootRoute = recurse(routeProp, undefined, '/')
    rootRoutes.value.push(rootRoute)

    return rootRoute
  }

  const push = (options: INavigateOptions) => {
    navigate(options, 'push')
  }

  const replace = (options: INavigateOptions) => {
    navigate(options, 'replace')
  }

  const go = (delta: number) => {
    history.go(delta)
  }

  const resolve = (
    options: INavigateOptions,
  ): { path: string; route: IRouteWithPathRegex<M> | undefined } => {
    let name: string | undefined
    let path: string | undefined
    let locationParts: Partial<ILocationParts> = {}

    if ('name' in options) {
      name = options.name
      locationParts = {
        params: options.params,
        query: options.query,
        hash: options.hash,
      }
    } else {
      path = options.path
    }

    const { routesMap, notFoundRoute } = routesMetadata.value

    if (!name && path === undefined) {
      throw new Error('Name or path required in router navigation')
    } else if (name && path) {
      throw new Error('only name or path in router navigation')
    }

    let route: IRouteWithPathRegex<M> | undefined

    if (name) {
      route = routesMap.get(name)
      if (!route && !notFoundRoute) {
        // When navigating by name, either targe route or not found route must exist.
        throw new Error(`No route with name ${name}`)
      }
    } else {
      const resolvedRoute = resolvePath(path as string)
      // When navigating by path, it's okay that both the target route and not found route
      // don't exist. In this case, nothing will be displayed in router-view.
      if (resolvedRoute) {
        locationParts = {
          params: resolvedRoute.params,
          query: resolvedRoute.query,
          hash: resolvedRoute.hash,
        }
        route = routesMap.get(resolvedRoute.name)
      }
    }
    route = route ?? notFoundRoute

    let targetPath: string
    if (!route || route.isNotFoundRoute) {
      // Don't resolve path in this case
      targetPath = path as string
    } else {
      targetPath = computeResolvedPath(route.mergedPath, locationParts)
    }
    return { path: targetPath, route }
  }

  const navigate = (options: INavigateOptions, navigationType: RouterNavigationType) => {
    const { path, route } = resolve(options)

    if (navigationType === 'push') {
      history.pushState(undefined, '', path)
    } else {
      history.replaceState(undefined, '', path)
    }
    if (!route) {
      matchedRoutes.value = []
    } else {
      recomputeMatchedRoutes(navigationType === 'push')
    }
  }
  // Scroll behavior
  async function handleScroll(
    to: IResolvedRoute<M> | undefined,
    from: IResolvedRoute<M> | undefined,
    isPush: boolean,
  ): // the return is not meant to be used
  Promise<unknown> {
    if (!scrollBehavior) return Promise.resolve()

    const scrollEl = document.querySelector(scrollRoot)
    if (from) {
      saveScrollPosition(getScrollKey(from.resolvedPath), computeScrollPosition(scrollEl))
    }

    let scrollPosition: _ScrollPositionNormalized | null = null
    if (to) {
      scrollPosition =
        (!isPush && getSavedScrollPosition(getScrollKey(to.resolvedPath))) || null
    }

    await nextTick()
    const scrollType = to?.scrollType ?? defaultScrollType
    if (to && scrollType === 'pollHeight') {
      await waitForRender(scrollEl, 500)
    }
    const position = await scrollBehavior(to, from, scrollPosition)
    if (position) {
      scrollToPosition(position, scrollEl)
    }
  }

  const resolvedRoute = (
    route: IRouteWithPathRegex<M>,
    resolvedPath: string,
    parent?: IResolvedRoute<M>,
  ): IResolvedRoute<M> => {
    const matchedParentRoutes = parent ? [...parent.matchedParentRoutes, parent] : []
    const parts = computeLocationParts(route, resolvedPath)
    return {
      ...route,
      ...parts,
      path: replaceParams(route.alias ?? route.path, parts.params),
      resolvedPath,
      matchedParentRoutes,
    }
  }

  const resolvePath = (
    resolvedPath: string,
    options?: IResolveRouteOptions,
  ): IResolvedRoute<M> | undefined => {
    const { matchNotFoundRoute } = options ?? {}
    const { rootDefaultRoute, notFoundRoute } = routesMetadata.value

    const rootRoute = matchRoute(rootRoutes.value, resolvedPath, rootDefaultRoute)
    let deepestMatchedRoute: IResolvedRoute<M> | undefined

    if (rootRoute) {
      const resolvedRootRoute = resolvedRoute(rootRoute, resolvedPath)
      deepestMatchedRoute = resolvedRootRoute

      const recurse = (
        parent: IRouteWithPathRegex<M>,
        resolvedParent: IResolvedRoute<M>,
      ) => {
        let firstMatch: IRouteWithPathRegex<M> | undefined = undefined
        if (parent.children) {
          for (const child of parent.children) {
            if (child.mergedPathRegex.test(resolvedPath)) {
              firstMatch = child
              break
            } else if (parent.alias && parent.alias === child.name) {
              firstMatch = child
            }
          }
        }
        if (firstMatch) {
          deepestMatchedRoute = resolvedRoute(firstMatch, resolvedPath, resolvedParent)
          recurse(firstMatch, deepestMatchedRoute)
        }
      }

      // Recursively update deepestMatchedRoute and matchedParentRoutes
      recurse(rootRoute, resolvedRootRoute)
    } else if (matchNotFoundRoute && notFoundRoute) {
      deepestMatchedRoute = {
        path: notFoundRoute.path,
        name: notFoundRoute.name,
        meta: notFoundRoute.meta,
        mergedPath: notFoundRoute.mergedPath,
        component: notFoundRoute.component,
        isNotFoundRoute: notFoundRoute.isNotFoundRoute,
        scrollType: notFoundRoute.scrollType,
        resolvedPath,
        params: {},
        query: {},
        hash: '',
        matchedParentRoutes: [],
      }
    }

    return deepestMatchedRoute
  }

  const findRouteByName = (name: string): IRouteWithPathRegex<M> | undefined => {
    return routesMetadata.value.routesMap.get(name)
  }

  const overwriteRouteComponent = (name: string, component: AnyComponent) => {
    const { routesMap } = routesMetadata.value
    const route = routesMap.get(name)
    if (!route) {
      throw new Error(`Cannot find route with name ${name}`)
    }
    route.component = markRaw(component)
  }

  const beforeEach = (callback: INavGuardCallback<M>) => {
    beforeEachHooks.add(callback)
    return () => beforeEachHooks.delete(callback)
  }

  const afterEach = (callback: INavGuardCallback<M>) => {
    afterEachHooks.add(callback)
    return () => afterEachHooks.delete(callback)
  }

  const route = computed(() => {
    const { length } = matchedRoutes.value
    return matchedRoutes.value[length - 1]
  })

  // Use without installing as a Vue app plugin
  const initialize = () => {
    // Use browser scroll behavior if no scrollBehavior is provided
    if (scrollBehavior && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    rootRoutes.value = routesOption.map((route) => addRoute(route))
    // Initialize matched routes
    recomputeMatchedRoutes(false)
  }

  const router: IRouter<M> = {
    initialize,
    addRoute,
    push,
    replace,
    resolve,
    go,
    resolvePath,
    findRouteByName,
    computeResolvedPath,
    overwriteRouteComponent,
    beforeEach,
    afterEach,
    pathTransform,
    matchedRoutes,
    route,
  }

  const loadComponent = async (route: IResolvedRoute<M>) => {
    if (typeof route.component === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loaded = await (route.component as any)()
      route.component = loaded.default
    }
  }

  const recomputeMatchedRoutes = (isPush: boolean) => {
    const path = getCurrentPath()
    const newRoute = resolvePath(path, {
      matchNotFoundRoute: true,
    })

    const oldRoute = matchedRoutes.value[matchedRoutes.value.length - 1]

    beforeEachHooks.forEach((callback) => {
      callback(newRoute, oldRoute)
    })

    if (newRoute) {
      const matched = [...newRoute.matchedParentRoutes, newRoute]
      Promise.all(matched.map((route) => loadComponent(route))).then(() => {
        matchedRoutes.value = matched
      })
    } else {
      matchedRoutes.value = []
    }

    afterEachHooks.forEach((callback) => {
      callback(newRoute, oldRoute)
    })

    if (newRoute?.scrollType !== 'none') {
      handleScroll(newRoute, oldRoute, isPush)
    }
  }

  const install = (app: App) => {
    app.provide<number>(RouteLevelSymbol, 0)
    app.provide<IRouter<M>>(RouterSymbol, router)
    app.component('router-link', RouterLink)
    app.component('router-view', RouterView)

    initialize()
  }

  window.addEventListener('popstate', () => {
    // Recompute matched routes when the active history entry changes.
    // For example, when the back/forward button in the browser is clicked.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
    recomputeMatchedRoutes(false)
  })

  return {
    ...router,
    install,
  }
}
