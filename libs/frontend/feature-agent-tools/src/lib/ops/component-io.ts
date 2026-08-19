import { makeSetStateData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  ISetComponentEditorEventData,
  ISetComponentEventData,
  ISetComponentInputData,
  ISetComponentStateData,
} from '@pubstudio/shared/type-command-data'
import {
  ComponentArgPrimitive,
  ComponentArgType,
  ComponentEventType,
  EditorEventName,
  IComponentEvent,
  IComponentState,
  IEditorEvent,
} from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint, exampleComponentId, mustResolveComponent } from '../op/op-helpers'
import { ARG_TYPES, behaviorIdField, componentIdField } from '../schema/fields'
import { arr, bool, json, obj, oneOf, record, str } from '../schema/schema'

const EVENT_TYPES = Object.values(ComponentEventType)
const EDITOR_EVENT_NAMES = Object.values(EditorEventName)

// Shared with addComponent's recursive create schema, so the two stay one vocabulary
export const eventBehaviorSchema = () =>
  obj({
    behaviorId: behaviorIdField(),
    args: record(json())
      .optional()
      .desc('Arguments passed to the behavior, keyed by argument name.'),
  })

export const eventNameField = () =>
  str().desc(`Event name. Built-in types: ${EVENT_TYPES.join(', ')}.`)

export const inputTypeField = () =>
  oneOf(ARG_TYPES)
    .dflt(ComponentArgPrimitive.String)
    .desc('Value type. Only used when creating a new input.')

export const inputAttrField = () =>
  bool()
    .dflt(true)
    .desc('Render as an HTML attribute. Only used when creating a new input.')

const behaviorsField = () =>
  arr(eventBehaviorSchema())
    .optional()
    .desc('Behaviors to run, in order. Omit to remove the event entirely.')

export const setComponentInputOp = defineOp<ISetComponentInputData>()({
  name: 'setComponentInput',
  command: CommandType.SetComponentInput,
  title: 'Set component input',
  description:
    'Set, change or remove a component input. Inputs with `attr: true` render as HTML ' +
    'attributes (href, src, alt, target…); others are values behaviors can read. ' +
    'Omit `value` to remove the input.',
  input: obj({
    componentId: componentIdField(),
    name: str().desc('Input name, e.g. "href".'),
    value: json().optional().desc('Input value. Omit to remove the input.'),
    type: inputTypeField(),
    attr: inputAttrField(),
  }),
  derived: ['oldInput', 'newInput'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const oldInput = component.inputs?.[input.name]
    if (input.value === undefined) {
      if (!oldInput) {
        ctx.warn(`${component.id} has no input "${input.name}"; nothing to remove`)
        return []
      }
      return {
        type: CommandType.SetComponentInput,
        data: { componentId: component.id, oldInput, newInput: undefined },
      }
    }
    const newInput = {
      ...oldInput,
      name: input.name,
      type: (oldInput?.type ??
        input.type ??
        ComponentArgPrimitive.String) as ComponentArgType,
      attr: oldInput?.attr ?? input.attr ?? true,
      is: input.value,
    }
    return {
      type: CommandType.SetComponentInput,
      data: { componentId: component.id, oldInput, newInput },
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    name: 'title',
    value: 'Set by agent',
  }),
})

export const setComponentEventOp = defineOp<ISetComponentEventData>()({
  name: 'setComponentEvent',
  command: CommandType.SetComponentEvent,
  title: 'Set component event',
  description:
    'Wire a runtime event on a component to a list of behaviors, replacing any existing ' +
    'event of the same name. Omit `behaviors` to remove the event. Behaviors are created ' +
    'with setBehavior; list existing ones with read({behaviors:true}).',
  input: obj({
    componentId: componentIdField(),
    name: eventNameField(),
    behaviors: behaviorsField(),
  }),
  derived: ['oldEvent', 'newEvent'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const oldEvent = component.events?.[input.name]
    if (!input.behaviors) {
      if (!oldEvent) {
        ctx.warn(`${component.id} has no event "${input.name}"; nothing to remove`)
        return []
      }
      return {
        type: CommandType.SetComponentEvent,
        data: { componentId: component.id, oldEvent, newEvent: undefined },
      }
    }
    const newEvent: IComponentEvent = {
      name: input.name,
      eventParams: oldEvent?.eventParams,
      behaviors: input.behaviors,
    }
    return {
      type: CommandType.SetComponentEvent,
      data: { componentId: component.id, oldEvent, newEvent },
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    name: ComponentEventType.Click,
    behaviors: [{ behaviorId: Object.keys(site.context.behaviors)[0] }],
  }),
})

export const setComponentEditorEventOp = defineOp<ISetComponentEditorEventData>()({
  name: 'setComponentEditorEvent',
  command: CommandType.SetComponentEditorEvent,
  title: 'Set component editor event',
  description:
    'Wire a builder-time event on a component. These run inside the builder only — they ' +
    'never appear in the published site. Omit `behaviors` to remove the event.',
  input: obj({
    componentId: componentIdField(),
    name: oneOf(EDITOR_EVENT_NAMES).desc('Editor event name.'),
    behaviors: behaviorsField(),
  }),
  derived: ['oldEvent', 'newEvent'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const oldEvent = component.editorEvents?.[input.name]
    if (!input.behaviors) {
      if (!oldEvent) {
        ctx.warn(`${component.id} has no editor event "${input.name}"; nothing to remove`)
        return []
      }
      return {
        type: CommandType.SetComponentEditorEvent,
        data: { componentId: component.id, oldEvent, newEvent: undefined },
      }
    }
    const newEvent: IEditorEvent = { name: input.name, behaviors: input.behaviors }
    return {
      type: CommandType.SetComponentEditorEvent,
      data: { componentId: component.id, oldEvent, newEvent },
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    name: EditorEventName.OnPageChange,
    behaviors: [{ behaviorId: Object.keys(site.context.behaviors)[0] }],
  }),
})

export const setComponentStateOp = defineOp<ISetComponentStateData>()({
  name: 'setComponentState',
  command: CommandType.SetComponentState,
  title: 'Set component state',
  description:
    'Add, update, rename or remove an entry in a component’s state — the values behaviors ' +
    'read and write at runtime. Omit `value` to remove the entry; pass `newKey` to rename it.',
  input: obj({
    componentId: componentIdField(),
    key: str().desc('State key.'),
    value: json().optional().desc('New value. Omit to remove the entry.'),
    newKey: str().optional().desc('Rename the entry to this key.'),
  }),
  derived: ['oldKey', 'oldVal', 'newKey', 'newVal'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const exists = component.state?.[input.key] !== undefined
    if (!exists && input.value === undefined) {
      constraint(`${component.id} has no state "${input.key}" to remove.`)
    }
    const data = exists
      ? makeSetStateData(
          component,
          input.key,
          input.newKey,
          input.value as IComponentState | undefined,
        )
      : { componentId: component.id, newKey: input.key, newVal: input.value }
    return { type: CommandType.SetComponentState, data: data as ISetComponentStateData }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    key: 'agentFlag',
    value: true,
  }),
})
