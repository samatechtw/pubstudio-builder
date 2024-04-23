import { Css } from './enum-css'
import { IComponent, IComponentEventBehavior, IComponentState } from './i-component'
import { ISite } from './i-site'

export type IBehaviorResult = unknown

export type IBehaviorCustomArgs = Record<string, unknown>

export interface IBehaviorHelpers {
  requireArgs(
    args: IBehaviorCustomArgs | undefined,
    argNames: string[],
  ): Record<string, string>
  getComponent(site: ISite, componentId: string): IComponent | undefined
  getValue(componentId: string, defaultVal?: string): string | undefined
  setContent(component: IComponent | undefined, content: string | undefined): void
  setState(component: IComponent | undefined, field: string, value: IComponentState): void
  setInputIs(component: IComponent | undefined, name: string, value: unknown): void
  getEventBehavior(component: IComponent, behaviorId: string): IComponentEventBehavior[]
  setCustomStyle(component: IComponent | undefined, prop: Css, value: string): void
  getCustomStyle(
    component: IComponent | undefined,
    prop: Css,
    value: string,
  ): string | undefined
  setLoading(component: IComponent | undefined, loading: boolean): void
  addRow(table: string, row: Record<string, string>): Promise<void>
}

export interface IBehaviorContext {
  site: ISite
  component: IComponent
  event?: Event
}

export type IResolvedBehavior = (
  helpers: IBehaviorHelpers,
  context: IBehaviorContext,
  args: IBehaviorCustomArgs,
) => IBehaviorResult
