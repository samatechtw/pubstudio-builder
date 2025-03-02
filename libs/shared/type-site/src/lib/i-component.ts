import { AriaRoleType } from './enum-aria-role'
import { TagType } from './enum-tag'
import { IComponentEditorEvents } from './i-editor-context'
import { IBehaviorCustomArgs, IResolvedBehavior } from './i-resolved-behavior'
import { IBreakpointStyles } from './i-style'

export enum ComponentArgPrimitive {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
  // A component, represented as an ID
  Component = 'component',
  // A location: anchor, page, external
  Location = 'location',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentArgArray<T extends ComponentArgPrimitive = any> = `${T}[]`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentArgObject<T extends ComponentArgPrimitive = any> = `${T}{}`

export const argArrayType = <T extends ComponentArgPrimitive>(
  p: T,
): ComponentArgArray<T> => {
  return `${p}[]`
}

export type ComponentArgType =
  | ComponentArgPrimitive
  | ComponentArgArray
  | ComponentArgObject

export interface IComponentInput {
  type: ComponentArgType
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any
  attr?: boolean
  // The value of this input
  is: unknown
}

export type IComponentInputs = Record<string, IComponentInput>

export interface IBehaviorArg {
  name: string
  type: ComponentArgType
  default?: unknown
  help: string
}

export interface IBehavior {
  id: string
  name: string
  args?: Record<string, IBehaviorArg>
  code?: string
  // Pre-resolved builtin behavior, to avoid the need for `eval`
  // Deprecated: https://github.com/samatechtw/pubstudio-builder/issues/673
  builtin?: IResolvedBehavior
}

export type IComponentState = string | number | boolean | Array<unknown> | object

export type IEventParams = Record<string, IEventParamEntry>

export type IEventParamEntry = {
  type: ComponentArgType
  value: string

  // TODO -- infoKey and options should be editor-only, not included in the site data
  // An info bubble will show next to the param if `infoKey` is truthy
  infoKey?: string
  options?: string[]
}

export interface IComponentEvent {
  // `ComponentEventType` or custom event
  name: string
  eventParams?: IEventParams
  behaviors: IComponentEventBehavior[]
}

export interface IComponentEventBehavior {
  // Args to pass to the attached behavior
  args?: IBehaviorCustomArgs
  behaviorId: string
}

// Map of event names to events
export type IComponentEvents = Record<string, IComponentEvent>

// Map of override IDs to styles
export type IComponentStyleOverrides = Record<string, IBreakpointStyles>

export interface IComponentStyle {
  custom: IBreakpointStyles
  mixins?: string[]
  // Custom style selectors scoped to this component
  overrides?: IComponentStyleOverrides
}
export interface IComponent {
  // ID unique to the namespace
  id: string
  // Human readable name
  name: string
  // HTML tag
  tag: TagType
  // ARIA role
  role?: AriaRoleType
  // HTML content.
  // This is also used to override custom component content.
  content?: string
  // DOM parent
  parent?: IComponent
  // DOM children
  children?: IComponent[]
  // ID of custom component to inherit properties from
  customSourceId?: string
  // Input values
  style: IComponentStyle
  state?: Record<string, IComponentState>
  inputs?: IComponentInputs
  events?: IComponentEvents
  editorEvents?: IComponentEditorEvents
}
