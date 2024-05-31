import { Component, DefineComponent } from 'vue'
import { ILocationParts } from './i-location-parts'
import {
  IResolvedRoute,
  IRoute,
  IRouteWithComponent,
  IRouteWithPathRegex,
} from './i-route'

export interface IRouter<M> {
  addRoute: (route: IRouteWithComponent<M>) => IRouteWithPathRegex<M>
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
    route: IRoute<M>,
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
}

export type INavigateOptions = INameNavigateOptions | IPathNavigateOptions

export interface INameNavigateOptions extends Partial<ILocationParts> {
  name: string
}

export interface IPathNavigateOptions {
  path: string
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
