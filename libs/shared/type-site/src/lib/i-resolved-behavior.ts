import { Css } from './enum-css'
import { IComponent, IComponentEventBehavior, IComponentState } from './i-component'
import { ISite } from './i-site'

export type IBehaviorResult = unknown

export type IBehaviorCustomArgs = Record<string, unknown>

export interface IBehaviorHelpers {
  getComponent(site: ISite, componentId: string): IComponent | undefined
  getValue(componentId: string, defaultVal?: string): string | undefined
  setContent(component: IComponent | undefined, content: string | undefined): void
  setState(component: IComponent | undefined, field: string, value: IComponentState): void
  setInputIs(component: IComponent, name: string, value: string): void
  getEventBehavior(component: IComponent, behaviorId: string): IComponentEventBehavior[]
  setCustomStyle(component: IComponent | undefined, prop: Css, value: string): void
  getCustomStyle(
    component: IComponent | undefined,
    prop: Css,
    value: string,
  ): string | undefined
}

export interface IBehaviorContext {
  site: ISite
  component: IComponent
}

export type IResolvedBehavior = (
  helpers: IBehaviorHelpers,
  context: IBehaviorContext,
  args: IBehaviorCustomArgs,
) => IBehaviorResult
