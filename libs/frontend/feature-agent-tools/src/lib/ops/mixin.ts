import {
  makeSetMixinEntryData,
  mixinStyleValue,
} from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddStyleMixinData,
  IEditStyleMixinData,
  IRemoveStyleMixinData,
  ISetMixinEntryData,
  IUpdateMixinOrderData,
} from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint, mustResolveMixin } from '../op/op-helpers'
import {
  breakpointIdField,
  cssPropertyField,
  mixinIdField,
  pseudoClassField,
  styleValueField,
} from '../schema/fields'
import { num, obj, str } from '../schema/schema'
import { styleEntriesField, toBreakpointStyles } from './style-entries'

export const addMixinOp = defineOp<IAddStyleMixinData>()({
  name: 'addMixin',
  command: CommandType.AddStyleMixin,
  title: 'Create a style mixin',
  description:
    'Create a reusable named style. Attach it to components with addComponentMixin. The ' +
    'new id is returned in createdMixinIds.',
  input: obj({
    name: str().desc('Human-readable mixin name.'),
    style: styleEntriesField().desc('Initial style entries for the mixin.'),
  }),
  derived: ['breakpoints'],
  omitted: {
    id: 'Allocated on apply and reported back as createdMixinIds.',
    isBuiltin: 'Only used when copying a builtin style into the site.',
  },
  resolve: (ctx, input) => ({
    type: CommandType.AddStyleMixin,
    data: {
      name: input.name,
      breakpoints: toBreakpointStyles(input.style, ctx.breakpointId),
    },
  }),
  example: () => ({
    name: 'Agent mixin',
    style: [{ property: Css.Color, value: '#123456' }],
  }),
})

export const renameMixinOp = defineOp<IEditStyleMixinData>()({
  name: 'renameMixin',
  command: CommandType.EditStyleMixin,
  title: 'Rename a style mixin',
  description: 'Change a mixin’s display name. Its id and styles are unchanged.',
  input: obj({ mixinId: mixinIdField(), name: str().desc('New mixin name.') }),
  derived: ['id', 'oldName', 'newName'],
  omitted: {},
  resolve: (ctx, input) => {
    const mixin = mustResolveMixin(ctx.site, input.mixinId)
    return {
      type: CommandType.EditStyleMixin,
      data: { id: mixin.id, oldName: mixin.name, newName: input.name },
    }
  },
  example: (site) => ({ mixinId: site.context.styleOrder[0], name: 'Renamed mixin' }),
})

export const removeMixinOp = defineOp<IRemoveStyleMixinData>()({
  name: 'removeMixin',
  command: CommandType.RemoveStyleMixin,
  title: 'Delete a style mixin',
  description:
    'Delete a mixin from the site. Components still referencing it keep a dangling id, so ' +
    'detach it with removeComponentMixin first.',
  input: obj({ mixinId: mixinIdField() }),
  derived: ['id', 'name', 'breakpoints', 'orderIndex'],
  omitted: {},
  resolve: (ctx, input) => {
    const mixin = mustResolveMixin(ctx.site, input.mixinId)
    return { type: CommandType.RemoveStyleMixin, data: structuredClone(mixin) }
  },
  example: (site) => ({
    mixinId: site.context.styleOrder[site.context.styleOrder.length - 1],
  }),
})

export const setMixinStyleOp = defineOp<ISetMixinEntryData>()({
  name: 'setMixinStyle',
  command: CommandType.SetMixinEntry,
  title: 'Set a mixin style',
  description:
    'Set or clear one CSS property inside a mixin, for one breakpoint and pseudo-class. ' +
    'Every component using the mixin picks up the change.',
  input: obj({
    mixinId: mixinIdField(),
    property: cssPropertyField(),
    value: styleValueField(),
    breakpointId: breakpointIdField(),
    pseudoClass: pseudoClassField(),
  }),
  derived: ['oldStyle', 'newStyle'],
  omitted: {},
  resolve: (ctx, input) => {
    const mixin = mustResolveMixin(ctx.site, input.mixinId)
    const breakpointId = input.breakpointId ?? ctx.breakpointId
    const target = {
      pseudoClass: input.pseudoClass ?? CssPseudoClass.Default,
      property: input.property,
    }
    if (
      input.value === undefined &&
      mixinStyleValue(mixin, breakpointId, target) === undefined
    ) {
      ctx.warn(`${input.property} is not set on mixin ${mixin.id}; nothing to remove`)
      return []
    }
    return {
      type: CommandType.SetMixinEntry,
      data: makeSetMixinEntryData(mixin, breakpointId, target, input.value),
    }
  },
  example: (site) => ({
    mixinId: site.context.styleOrder[0],
    property: Css.FontSize,
    value: '18px',
  }),
})

export const updateMixinOrderOp = defineOp<IUpdateMixinOrderData>()({
  name: 'updateMixinOrder',
  command: CommandType.UpdateMixinOrder,
  title: 'Reorder site mixins',
  description:
    'Move a mixin within the site-wide mixin order, which decides the order the mixin ' +
    'stylesheets are emitted in.',
  input: obj({
    mixinId: mixinIdField(),
    index: num().desc('New position in the site mixin order, starting at 0.'),
  }),
  derived: ['pos', 'newPos'],
  omitted: {},
  resolve: (ctx, input) => {
    const order = ctx.site.context.styleOrder
    const pos = order.indexOf(input.mixinId)
    if (pos < 0) {
      constraint(`Mixin ${input.mixinId} is not in the site mixin order.`)
    }
    if (input.index < 0 || input.index >= order.length) {
      constraint(`index must be between 0 and ${order.length - 1}.`)
    }
    return { type: CommandType.UpdateMixinOrder, data: { pos, newPos: input.index } }
  },
  example: (site) => ({
    mixinId: site.context.styleOrder[site.context.styleOrder.length - 1],
    index: 0,
  }),
})
