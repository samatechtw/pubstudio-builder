import {
  makeEditComponentData,
  makeRemoveComponentData,
} from '@pubstudio/frontend/util-command-data'
import { builtinComponents } from '@pubstudio/frontend/util-builtin'
import { clone } from '@pubstudio/frontend/util-component'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  IAddCustomComponentData,
  IEditComponentData,
  IEditComponentFields,
  IMergeComponentStyleData,
  IMoveComponentData,
  IRemoveComponentData,
  IReplacePageRootData,
} from '@pubstudio/shared/type-command-data'
import { AriaRole, Css, Tag } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import {
  constraint,
  exampleComponentId,
  examplePageRoute,
  mustResolveComponent,
  mustResolvePage,
} from '../op/op-helpers'
import { componentIdField, routeField, TAGS, tagField } from '../schema/fields'
import { num, obj, oneOf, str } from '../schema/schema'
import { styleEntriesField, toBreakpointStyles } from './style-entries'

const ARIA_ROLES = Object.values(AriaRole)

export const addComponentOp = defineOp<IAddComponentData>()({
  name: 'addComponent',
  command: CommandType.AddComponent,
  title: 'Add component',
  description:
    'Create a component under an existing parent. Give `sourceId` to deep-copy a ' +
    'component that already exists in this site, or `customComponentId` to insert an ' +
    'instance of a custom component. The new id is returned in createdComponentIds; ' +
    'children are created with further addComponent ops. Builtin ids from ' +
    'read({builtins:true}) are NOT valid sources — build those out explicitly.',
  input: obj({
    parentId: componentIdField().desc('Id of the component to add the new child under.'),
    tag: tagField()
      .optional()
      .desc(
        'HTML tag. Required unless `sourceId` or `customComponentId` is provided; ' +
          'sourced components use the source tag.',
      ),
    name: str().optional().desc('Component name shown in the builder tree.'),
    content: str()
      .optional()
      .desc('Inner HTML content. Only meaningful for text-bearing tags.'),
    parentIndex: num()
      .optional()
      .desc('Index in the parent’s children. Appends when omitted.'),
    sourceId: str()
      .optional()
      .desc(
        'Id of a component in this site to copy tag, style, inputs, events and children ' +
          'from. Builtin ids are rejected.',
      ),
    customComponentId: str()
      .optional()
      .desc(
        'Id of a component registered with addCustomComponent, to instantiate. ' +
          'read({tree:{}}) marks instances as "[custom: <id>]".',
      ),
    style: styleEntriesField().desc(
      'Styles applied to the new component. Equivalent to setComponentStyle ops afterwards.',
    ),
  }),
  derived: ['id', 'selectedComponentId'],
  omitted: {
    children: 'Deep child trees come from `sourceId`; otherwise add children explicitly.',
    state: 'Use setComponentState after creation.',
    inputs: 'Use setComponentInput after creation.',
    events: 'Use setComponentEvent after creation.',
    editorEvents: 'Use setComponentEditorEvent after creation.',
    hidden: 'Builder tree visibility; captured automatically when undoing.',
  },
  resolve: (ctx, input) => {
    mustResolveComponent(ctx.site, input.parentId)
    // addComponentHelper resolves both against site components only; a miss degrades to a
    // bare tag and still reports success. Builtins are never found.
    const sourceComponent = input.sourceId
      ? ctx.site.context.components[input.sourceId]
      : undefined
    if (input.sourceId && !sourceComponent) {
      constraint(
        builtinComponents[input.sourceId]
          ? `sourceId "${input.sourceId}" is a builtin, which addComponent cannot copy. ` +
              'Add the component and its children explicitly, or copy an instance that ' +
              'is already in the site.'
          : `No component "${input.sourceId}" to copy from. See read({tree:{}}).`,
      )
    }
    const customComponent = input.customComponentId
      ? ctx.site.context.components[input.customComponentId]
      : undefined
    if (input.customComponentId) {
      if (!customComponent) {
        constraint(`No component "${input.customComponentId}" to instantiate.`)
      }
      if (!ctx.site.context.customComponentIds.has(input.customComponentId)) {
        constraint(
          `${input.customComponentId} is not a custom component. Register it with ` +
            'addCustomComponent first, or copy it with sourceId instead.',
        )
      }
    }
    const tag = sourceComponent?.tag ?? customComponent?.tag ?? input.tag
    if (!tag) {
      constraint('`tag` is required without `sourceId` or `customComponentId`.')
    }
    const custom = toBreakpointStyles(input.style, ctx.breakpointId)
    const data: IAddComponentData = {
      tag,
      name: input.name,
      content: input.content,
      parentId: input.parentId,
      parentIndex: input.parentIndex,
      sourceId: input.sourceId,
      customComponentId: input.customComponentId,
      style: input.style ? { custom } : undefined,
      selectedComponentId: ctx.site.editor?.selectedComponent?.id,
    }
    return { type: CommandType.AddComponent, data }
  },
  example: (site) => ({
    parentId: site.pages[examplePageRoute(site)].root.id,
    tag: Tag.Div,
    name: 'Agent block',
    style: [{ property: Css.Width, value: '50%' }],
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
