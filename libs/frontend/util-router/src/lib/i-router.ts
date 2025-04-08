import { Component, ComputedRef, DefineComponent, Ref } from 'vue'
import { ILocationParts } from './i-location-parts'
import { IResolvedRoute, IRouteWithComponent, IRouteWithPathRegex } from './i-route'

export type PathTransform = (path: string | undefined) => string | undefined

export interface IRouter<M> {
  matchedRoutes: Ref<IResolvedRoute<M>[]>
  route: ComputedRef<IResolvedRoute<M> | undefined>
  initialize: () => void
  addRoute: (route: IRouteWithComponent<M>) => IRouteWithPathRegex<M>
  resolve: (options: INameNavigateOptions) => {
    path: string
    route: IRouteWithPathRegex<M> | undefined
  }
  push: (options: INavigateOptions) => void
  replace: (options: INavigateOptions) => void
  /**
   * This function is equivalent to `window.history.go()`.
   */
  go: (delta: number) => void
  /**
   * Find route by resolved path.
   * For example, `/users/1/cart-items/2` will resolve to a route with path
   * `/users/:userId`, including a children route with path `/cart-items/:itemId`, if present.
   */
  resolvePath: (
    resolvedPath: string,
    options?: IResolveRouteOptions,
  ) => IResolvedRoute<M> | undefined
  findRouteByName: (name: string) => IRouteWithPathRegex<M> | undefined
  computeResolvedPath: (
    path: string | undefined,
    locationParts: Partial<ILocationParts>,
  ) => string
  overwriteRouteComponent: (name: string, component: Component | DefineComponent) => void
  /**
   * Returns a function that removes the registered hook.
   */
  beforeEach: (callback: INavGuardCallback<M>) => () => void
  /**
   * Returns a function that removes the registered hook.
   */
  afterEach: (callback: INavGuardCallback<M>) => () => void
  /**
   * Optional transform function for modifying router paths
   */
  pathTransform: PathTransform
}

export type IDefaultRouteType = Record<string, unknown>

export type INavigateOptions = INameNavigateOptions | IPathNavigateOptions

export interface INameNavigateOptions extends Partial<ILocationParts> {
  name: string | undefined
}

export interface IPathNavigateOptions {
  path: string | undefined
}

export interface IResolveRouteOptions {
  /**
   * @default false
   */
  matchNotFoundRoute?: boolean
}

export type INavGuardCallback<M> = (
  to: IResolvedRoute<M> | undefined,
  from: IResolvedRoute<M> | undefined,
) => void
