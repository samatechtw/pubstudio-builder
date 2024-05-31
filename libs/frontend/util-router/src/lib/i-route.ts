import { Component, DefineComponent } from 'vue'
import { ILocationParts } from './i-location-parts'

export interface IRoute<M> {
  name: string
  path: string
  alias?: string
  meta?: M
}

// TODO -- add scrollType for letting the component trigger scrolling
export type ScrollType =
  | 'pollHeight' // Poll root scrollHeight until it changes
  | 'none' // Do not handle scroll

export interface IRouteWithComponent<M> extends IRoute<M> {
  component: Component | DefineComponent
  children?: IRouteWithComponent<M>[]
  /**
   * @default false
   */
  isNotFoundRoute?: boolean
  scrollType?: ScrollType
}

export interface IRouteWithPathRegex<M> extends Omit<IRouteWithComponent<M>, 'children'> {
  mergedPath: string
  mergedPathRegex: RegExp
  children?: IRouteWithPathRegex<M>[]
}

export interface IResolvedRoute<M = undefined>
  extends Omit<IRouteWithComponent<M>, 'children'>,
    ILocationParts {
  resolvedPath: string
  matchedParentRoutes: IResolvedRoute<M>[]
}
