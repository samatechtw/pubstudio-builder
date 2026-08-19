import { builtinBehaviors, builtinComponents } from '@pubstudio/frontend/util-builtin'
import {
  makeEditComponentData,
  makeRemoveComponentData,
} from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import { resolveBehavior, resolveStyle } from '@pubstudio/frontend/util-resolve'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddComponentChildData,
  IAddComponentData,
  IAddCustomComponentData,
  IEditComponentData,
  IEditComponentFields,
  IMergeComponentStyleData,
  IMoveComponentData,
  IRemoveComponentData,
  IReplacePageRootData,
} from '@pubstudio/shared/type-command-data'
import {
  AriaRole,
  ComponentArgPrimitive,
  Css,
  IComponentEvents,
  IComponentInputs,
  IComponentState,
  IComponentStyle,
  Tag,
} from '@pubstudio/shared/type-site'
import { defineOp, IOpCtx } from '../op/define-op'
import {
  constraint,
  exampleComponentId,
  examplePageRoute,
  mustResolveComponent,
  mustResolvePage,
} from '../op/op-helpers'
import {
  componentIdField,
  mixinIdField,
  routeField,
  tagField,
  TAGS,
} from '../schema/fields'
import {
  arr,
  Infer,
  json,
  lazySchema,
  num,
  obj,
  oneOf,
  record,
  Schema,
  str,
} from '../schema/schema'
import {
  eventBehaviorSchema,
  eventNameField,
  inputAttrField,
  inputTypeField,
} from './component-io'
import { IStyleEntryInput, styleEntriesField, toBreakpointStyles } from './style-entries'

const ARIA_ROLES = Object.values(AriaRole)

// A recursive tree can smuggle an unbounded synchronous command past MAX_OPS,
// so the whole input is bounded up front.
export const MAX_TREE_NODES = 500
export const MAX_TREE_DEPTH = 25

const inputEntrySchema = () =>
  obj({
    name: str().desc('Input name, e.g. "href".'),
    value: json().desc('Input value.'),
    type: inputTypeField(),
    attr: inputAttrField(),
  })

const eventEntrySchema = () =>
  obj({
    name: eventNameField(),
    behaviors: arr(eventBehaviorSchema()).desc('Behaviors to run, in order.'),
  })

type IComponentInputEntry = Infer<ReturnType<typeof inputEntrySchema>>
type IComponentEventEntry = Infer<ReturnType<typeof eventEntrySchema>>

export interface IComponentCreateInput {
  tag?: Tag
  name?: string
  role?: AriaRole
  content?: string
  sourceId?: string
  customComponentId?: string
  style?: IStyleEntryInput[]
  mixinIds?: string[]
  inputs?: IComponentInputEntry[]
  state?: Record<string, unknown>
  events?: IComponentEventEntry[]
  children?: IComponentCreateInput[]
}

// One node of the create tree. Spread into the root input, referenced recursively via
// $defs/componentCreate for `children`.
const componentCreateFields = (childSchema: Schema<IComponentCreateInput>) => ({
  tag: tagField()
    .optional()
    .desc(
      'HTML tag. Required unless `sourceId` or `customComponentId` is provided; ' +
        'sourced components use the source tag.',
    ),
  name: str().optional().desc('Component name shown in the builder tree.'),
  role: oneOf(ARIA_ROLES, 'ariaRole').optional().desc('ARIA role.'),
  content: str()
    .optional()
    .desc(
      'Inner HTML content. Only meaningful for text-bearing tags, and not combinable ' +
        'with `children` — content is hidden when a component has children.',
    ),
  sourceId: str()
    .optional()
    .desc(
      'Id of a component in this site to copy tag, style, inputs, events and children ' +
        'from. Builtin ids are rejected. Not combinable with `children`.',
    ),
  customComponentId: str()
    .optional()
    .desc(
      'Id of a component registered with addCustomComponent, to instantiate. ' +
        'read({tree:{}}) marks instances as "[custom: <id>]". Not combinable with ' +
        '`children`.',
    ),
  style: styleEntriesField().desc(
    'Styles applied to the new component. Equivalent to setComponentStyle ops afterwards.',
  ),
  mixinIds: arr(mixinIdField())
    .optional()
    .desc(
      'Style mixins to attach, in cascade order — later mixins win. ' +
        'Equivalent to addComponentMixin ops afterwards.',
    ),
  inputs: arr(inputEntrySchema())
    .optional()
    .desc(
      'Initial inputs, same vocabulary as setComponentInput. Inputs with attr:true ' +
        'render as HTML attributes (href, src, alt, target…).',
    ),
  state: record(json())
    .optional()
    .desc('Initial state entries — the JSON values behaviors read and write at runtime.'),
  events: arr(eventEntrySchema())
    .optional()
    .desc(
      'Runtime events wired to behavior lists, same vocabulary as setComponentEvent.',
    ),
  children: arr(childSchema)
    .optional()
    .desc(
      'Child components, created in array order with this same recursive shape. Ids are ' +
        'allocated during apply and reported in createdComponentTrees.',
    ),
})

const componentCreateSchema: Schema<IComponentCreateInput> = lazySchema(
  'componentCreate',
  (self) => obj(componentCreateFields(self)),
)

const toComponentStyle = (
  node: IComponentCreateInput,
  breakpointId: string,
): IComponentStyle | undefined => {
  const mixins = node.mixinIds?.length ? [...node.mixinIds] : undefined
  if (!node.style && !mixins) {
    return undefined
  }
  const style: IComponentStyle = { custom: toBreakpointStyles(node.style, breakpointId) }
  if (mixins) {
    style.mixins = mixins
  }
  return style
}

const toComponentInputs = (
  entries: IComponentInputEntry[] | undefined,
): IComponentInputs | undefined => {
  if (!entries?.length) {
    return undefined
  }
  const inputs: IComponentInputs = {}
  for (const entry of entries) {
    inputs[entry.name] = {
      name: entry.name,
      type: entry.type ?? ComponentArgPrimitive.String,
      attr: entry.attr ?? true,
      is: entry.value,
    }
  }
  return inputs
}

const toComponentEvents = (
  entries: IComponentEventEntry[] | undefined,
): IComponentEvents | undefined => {
  if (!entries?.length) {
    return undefined
  }
  const events: IComponentEvents = {}
  for (const entry of entries) {
    events[entry.name] = { name: entry.name, behaviors: entry.behaviors }
  }
  return events
}

// Validates one node and everything it references, then recurses. Nothing can fail
// after this returns, the whole tree becomes a single command, so a deep error here
// is the difference between "no mutation" and a partial apply.
const resolveCreateNode = (
  ctx: IOpCtx,
  node: IComponentCreateInput,
  path: string,
  counter: { nodes: number },
  depth: number,
): IAddComponentChildData => {
  counter.nodes += 1
  if (counter.nodes > MAX_TREE_NODES) {
    constraint(
      `The component tree has more than ${MAX_TREE_NODES} nodes. ` +
        'Split the build into multiple addComponent ops.',
    )
  }
  const at = (field: string): string => (path ? `${path}.${field}` : field)
  if (depth > MAX_TREE_DEPTH) {
    constraint(`${at('children')} exceeds the maximum tree depth of ${MAX_TREE_DEPTH}.`)
  }
  const children = node.children?.length ? node.children : undefined
  // addComponentHelper resolves both against site components only; a miss degrades to a
  // bare tag and still reports success. Builtins are never found.
  const sourceComponent = node.sourceId
    ? ctx.site.context.components[node.sourceId]
    : undefined
  if (node.sourceId && !sourceComponent) {
    constraint(
      builtinComponents[node.sourceId]
        ? `${at('sourceId')} "${node.sourceId}" is a builtin, which addComponent cannot ` +
            'copy. Add the component and its children explicitly, or copy an instance ' +
            'that is already in the site.'
        : `${at('sourceId')}: no component "${node.sourceId}" to copy from. ` +
            'See read({tree:{}}).',
    )
  }
  const customComponent = node.customComponentId
    ? ctx.site.context.components[node.customComponentId]
    : undefined
  if (node.customComponentId) {
    if (!customComponent) {
      constraint(
        `${at('customComponentId')}: no component "${node.customComponentId}" to instantiate.`,
      )
    }
    if (!ctx.site.context.customComponentIds.has(node.customComponentId)) {
      constraint(
        `${at('customComponentId')}: ${node.customComponentId} is not a custom ` +
          'component. Register it with addCustomComponent first, or copy it with ' +
          'sourceId instead.',
      )
    }
  }
  const tag = sourceComponent?.tag ?? customComponent?.tag ?? node.tag
  if (!tag) {
    constraint(`${at('tag')} is required without \`sourceId\` or \`customComponentId\`.`)
  }
  if (children && node.content !== undefined) {
    constraint(
      `${at('content')} cannot be combined with \`children\` — PubStudio hides content ` +
        'when a component has children.',
    )
  }
  if (children && (node.sourceId || node.customComponentId)) {
    constraint(
      `${at('children')} cannot be combined with \`sourceId\` or \`customComponentId\` — ` +
        'a source owns its copied subtree. Wrap the sourced node in another component ' +
        'to give it siblings.',
    )
  }
  node.mixinIds?.forEach((mixinId, i) => {
    if (!resolveStyle(ctx.site.context, mixinId)) {
      constraint(
        `${at(`mixinIds[${i}]`)}: no style mixin "${mixinId}". See read({mixins:true}).`,
      )
    }
  })
  const inputNames = new Set<string>()
  node.inputs?.forEach((entry, i) => {
    if (inputNames.has(entry.name)) {
      constraint(`${at(`inputs[${i}]`)}: duplicate input "${entry.name}".`)
    }
    inputNames.add(entry.name)
  })
  const eventNames = new Set<string>()
  node.events?.forEach((event, i) => {
    if (eventNames.has(event.name)) {
      constraint(`${at(`events[${i}]`)}: duplicate event "${event.name}".`)
    }
    eventNames.add(event.name)
    event.behaviors.forEach((behavior, j) => {
      const known =
        resolveBehavior(ctx.site.context, behavior.behaviorId) ??
        builtinBehaviors[behavior.behaviorId]
      if (!known) {
        constraint(
          `${at(`events[${i}].behaviors[${j}]`)}: no behavior ` +
            `"${behavior.behaviorId}". See read({behaviors:true}).`,
        )
      }
    })
  })
  return {
    tag,
    name: node.name,
    role: node.role,
    content: node.content,
    sourceId: node.sourceId,
    customComponentId: node.customComponentId,
    style: toComponentStyle(node, ctx.breakpointId),
    state: node.state as Record<string, IComponentState> | undefined,
    inputs: toComponentInputs(node.inputs),
    events: toComponentEvents(node.events),
    children: children?.map((child, i) =>
      resolveCreateNode(ctx, child, at(`children[${i}]`), counter, depth + 1),
    ),
  }
}

export const addComponentOp = defineOp<IAddComponentData>()({
  name: 'addComponent',
  command: CommandType.AddComponent,
  title: 'Add component',
  description:
    'Create a component — or a whole component tree — under an existing parent in ONE ' +
    'op. Each node takes tag/name/content/role, style entries, `mixinIds`, `inputs`, ' +
    '`state`, runtime `events` and recursive `children` of the same shape (max ' +
    `${MAX_TREE_NODES} nodes, depth ${MAX_TREE_DEPTH}). Give \`sourceId\` to deep-copy a ` +
    'component that already exists in this site, or `customComponentId` to insert an ' +
    'instance of a custom component; neither combines with explicit `children`. The ' +
    'root id is returned in createdComponentIds, and every created id (including ' +
    'implicit source/custom descendants) in createdComponentTrees. Builtin ids from ' +
    'read({builtins:true}) are NOT valid sources — build those out explicitly.',
  input: obj({
    parentId: componentIdField().desc('Id of the component to add the new child under.'),
    parentIndex: num()
      .optional()
      .desc('Index in the parent’s children. Appends when omitted.'),
    ...componentCreateFields(componentCreateSchema),
  }),
  derived: ['id', 'selectedComponentId'],
  omitted: {
    editorEvents:
      'Builder-only events, and they can run side effects mid-command. Use ' +
      'setComponentEditorEvent after creation.',
    hidden: 'Builder tree visibility; captured automatically when undoing.',
  },
  resolve: (ctx, input) => {
    mustResolveComponent(ctx.site, input.parentId)
    const counter = { nodes: 0 }
    const node = resolveCreateNode(ctx, input, '', counter, 1)
    const data: IAddComponentData = {
      ...node,
      parentId: input.parentId,
      parentIndex: input.parentIndex,
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
    }
    return { type: CommandType.AddComponent, data }
  },
  example: (site) => ({
    parentId: site.pages[examplePageRoute(site)].root.id,
    tag: Tag.Div,
    name: 'Agent block',
    style: [{ property: Css.Width, value: '50%' }],
    children: [
      { tag: Tag.H2, name: 'Agent title', content: 'Added by agent' },
      {
        tag: Tag.Div,
        name: 'Agent body',
        style: [{ property: Css.Display, value: 'flex' }],
        children: [{ tag: Tag.Span, name: 'Agent detail', content: 'Nested' }],
      },
    ],
  }),
})

export const editComponentOp = defineOp<IEditComponentData>()({
  name: 'editComponent',
  command: CommandType.EditComponent,
  title: 'Edit component fields',
  description:
    'Change a component’s name, tag, ARIA role or text content. Only the fields you ' +
    'pass are changed. Styles, inputs and events have their own ops.',
  input: obj({
    componentId: componentIdField(),
    name: str().optional().desc('Component name shown in the builder tree.'),
    tag: oneOf(TAGS, 'tag').optional().desc('HTML tag.'),
    role: oneOf(ARIA_ROLES, 'ariaRole').optional().desc('ARIA role.'),
    content: str().optional().desc('Inner HTML content.'),
  }),
  derived: ['id', 'new', 'old'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const fields: IEditComponentFields = {}
    if (input.name !== undefined) fields.name = input.name
    if (input.tag !== undefined) fields.tag = input.tag
    if (input.role !== undefined) fields.role = input.role
    if (input.content !== undefined) fields.content = input.content
    if (!Object.keys(fields).length) {
      constraint('Pass at least one of name, tag, role or content.')
    }
    return {
      type: CommandType.EditComponent,
      data: makeEditComponentData(component, fields),
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    name: 'Renamed by agent',
  }),
})

export const removeComponentOp = defineOp<IRemoveComponentData>()({
  name: 'removeComponent',
  command: CommandType.RemoveComponent,
  title: 'Remove component',
  description:
    'Delete a component and its subtree. A page root cannot be removed — use ' +
    'replacePageRoot or removePage instead.',
  input: obj({ componentId: componentIdField() }),
  derived: [
    'id',
    'name',
    'tag',
    'role',
    'content',
    'parentId',
    'parentIndex',
    'customComponentId',
    'style',
    'state',
    'inputs',
    'events',
    'editorEvents',
    'children',
    'hidden',
  ],
  omitted: {
    sourceId: 'Not part of the removal snapshot; the subtree is captured verbatim.',
    selectedComponentId: 'Selection is restored from the recreated component on undo.',
  },
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    if (!component.parent) {
      constraint(
        `${component.id} is a page root; use replacePageRoot or removePage instead.`,
      )
    }
    return {
      type: CommandType.RemoveComponent,
      data: makeRemoveComponentData(ctx.site, component),
    }
  },
  example: (site) => ({ componentId: exampleComponentId(site) }),
})

export const moveComponentOp = defineOp<IMoveComponentData>()({
  name: 'moveComponent',
  command: CommandType.MoveComponent,
  title: 'Move component',
  description:
    'Move a component to a new parent and index. The index is the position among the ' +
    'target parent’s children after the component is detached from its old parent.',
  input: obj({
    componentId: componentIdField(),
    parentId: componentIdField().desc('Id of the new parent.'),
    index: num().desc('Insertion index among the new parent’s children.'),
  }),
  derived: ['from', 'to', 'selectedComponentId'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const toParent = mustResolveComponent(ctx.site, input.parentId)
    const fromParent = component.parent
    const fromIndex = fromParent?.children?.findIndex((c) => c.id === component.id) ?? -1
    if (!fromParent || fromIndex < 0) {
      constraint(`${component.id} is a page root and cannot be moved.`)
    }
    const data: IMoveComponentData = {
      from: { parentId: fromParent.id, index: fromIndex },
      to: { parentId: toParent.id, index: input.index },
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
    }
    return { type: CommandType.MoveComponent, data }
  },
  example: (site) => {
    const id = exampleComponentId(site)
    const parent = site.context.components[id].parent
    const index = parent?.children?.findIndex((c) => c.id === id) ?? 0
    return { componentId: id, parentId: parent?.id ?? id, index: index === 0 ? 1 : 0 }
  },
})

export const replacePageRootOp = defineOp<IReplacePageRootData>()({
  name: 'replacePageRoot',
  command: CommandType.ReplacePageRoot,
  title: 'Replace page root',
  description:
    'Swap a page’s root component for a copy of `sourceComponentId`, discarding the ' +
    'old root and its subtree. Use this to apply a whole layout to a page at once.',
  input: obj({
    route: routeField(),
    sourceComponentId: componentIdField().desc('Component to copy as the new root.'),
  }),
  derived: ['pageRoute', 'oldRoot', 'replacementComponent'],
  omitted: {},
  resolve: (ctx, input) => {
    const page = mustResolvePage(ctx.site, input.route)
    const source = mustResolveComponent(ctx.site, input.sourceComponentId)
    const data: IReplacePageRootData = {
      pageRoute: page.route,
      oldRoot: makeRemoveComponentData(ctx.site, page.root, true),
      replacementComponent: {
        name: source.name,
        tag: source.tag,
        content: source.content,
        parentId: '',
        sourceId: source.id,
      },
    }
    return { type: CommandType.ReplacePageRoot, data }
  },
  example: (site) => ({
    route: examplePageRoute(site),
    sourceComponentId: exampleComponentId(site),
  }),
})

export const mergeComponentStyleOp = defineOp<IMergeComponentStyleData>()({
  name: 'mergeComponentStyle',
  command: CommandType.MergeComponentStyle,
  title: 'Merge styles from another component',
  description:
    'Copy the custom styles and mixins of `fromComponentId` onto `componentId`. Existing ' +
    'properties on the target are overwritten; properties it has that the source does not ' +
    'are kept.',
  input: obj({
    componentId: componentIdField().desc('Component that receives the styles.'),
    fromComponentId: componentIdField().desc('Component to copy styles from.'),
  }),
  derived: ['oldStyle', 'newStyle'],
  omitted: {},
  resolve: (ctx, input) => {
    const target = mustResolveComponent(ctx.site, input.componentId)
    const from = mustResolveComponent(ctx.site, input.fromComponentId)
    const data: IMergeComponentStyleData = {
      componentId: target.id,
      oldStyle: clone(serializeComponent(target).style),
      newStyle: clone(serializeComponent(from).style),
    }
    return { type: CommandType.MergeComponentStyle, data }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    fromComponentId: site.pages[examplePageRoute(site)].root.id,
  }),
})

export const addCustomComponentOp = defineOp<IAddCustomComponentData>()({
  name: 'addCustomComponent',
  command: CommandType.AddCustomComponent,
  title: 'Make component reusable',
  description:
    'Register an existing component as a custom (reusable) component. Instances are then ' +
    'created with addComponent({customComponentId}).',
  input: obj({ componentId: componentIdField() }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    return {
      type: CommandType.AddCustomComponent,
      data: { componentId: component.id },
    }
  },
  example: (site) => ({ componentId: exampleComponentId(site) }),
})
