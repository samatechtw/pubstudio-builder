import {
  componentOverrideStyleValue,
  componentStyleValue,
  makeSetComponentCustomStyleData,
  makeSetComponentOverrideStyleData,
} from '@pubstudio/frontend/util-command-data'
import { clone } from '@pubstudio/frontend/util-component'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddComponentMixinData,
  IRemoveComponentMixinData,
  IRemoveComponentOverrideStyleData,
  IReplaceComponentMixinData,
  ISetComponentCustomStyleData,
  ISetComponentOverrideStyleData,
} from '@pubstudio/shared/type-command-data'
import { Css, CssPseudoClass } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import {
  constraint,
  exampleComponentId,
  mustResolveComponent,
  mustResolveMixin,
} from '../op/op-helpers'
import {
  breakpointIdField,
  componentIdField,
  cssPropertyField,
  mixinIdField,
  pseudoClassField,
  styleValueField,
} from '../schema/fields'
import { obj, str } from '../schema/schema'

export const setComponentStyleOp = defineOp<ISetComponentCustomStyleData>()({
  name: 'setComponentStyle',
  command: CommandType.SetComponentCustomStyle,
  title: 'Set component style',
  description:
    'Set or clear one CSS property on a component, for one breakpoint and pseudo-class. ' +
    'This is the component’s own style, which wins over any mixin it uses. Smaller ' +
    'breakpoints inherit from larger ones, so set the base value on the default ' +
    'breakpoint and only override where it differs. Use ' +
    'read({styles:{componentId,resolved:true}}) to see what is actually in effect.',
  input: obj({
    componentId: componentIdField(),
    property: cssPropertyField(),
    value: styleValueField(),
    breakpointId: breakpointIdField(),
    pseudoClass: pseudoClassField(),
  }),
  derived: ['oldStyle', 'newStyle'],
  omitted: {
    select:
      'Builder-only. Agent ops always pass false so a batch does not fight the ' +
      'user’s selection.',
  },
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const breakpointId = input.breakpointId ?? ctx.breakpointId
    const target = {
      pseudoClass: input.pseudoClass ?? CssPseudoClass.Default,
      property: input.property,
    }
    if (
      input.value === undefined &&
      componentStyleValue(component, breakpointId, target) === undefined
    ) {
      ctx.warn(
        `${input.property} is not set on ${component.id} at ${breakpointId}; nothing to remove`,
      )
      return []
    }
    return {
      type: CommandType.SetComponentCustomStyle,
      data: makeSetComponentCustomStyleData(
        component,
        breakpointId,
        target,
        input.value,
        false,
      ),
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    property: Css.BackgroundColor,
    value: '#ff0000',
  }),
})

export const setOverrideStyleOp = defineOp<ISetComponentOverrideStyleData>()({
  name: 'setOverrideStyle',
  command: CommandType.SetComponentOverrideStyle,
  title: 'Set override style',
  description:
    'Set or clear one CSS property in a component-scoped selector override, e.g. a child ' +
    'selector or a state selector that plain component styles cannot express.',
  input: obj({
    componentId: componentIdField(),
    selector: str().desc('Selector scoped to the component, e.g. "> div" or ".active".'),
    property: cssPropertyField(),
    value: styleValueField(),
    breakpointId: breakpointIdField(),
    pseudoClass: pseudoClassField(),
  }),
  derived: ['oldStyle', 'newStyle'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const breakpointId = input.breakpointId ?? ctx.breakpointId
    const target = {
      pseudoClass: input.pseudoClass ?? CssPseudoClass.Default,
      property: input.property,
    }
    if (
      input.value === undefined &&
      componentOverrideStyleValue(component, input.selector, breakpointId, target) ===
        undefined
    ) {
      ctx.warn(
        `${input.property} is not set on ${component.id} "${input.selector}"; nothing to remove`,
      )
      return []
    }
    return {
      type: CommandType.SetComponentOverrideStyle,
      data: makeSetComponentOverrideStyleData(
        component,
        input.selector,
        breakpointId,
        target,
        input.value,
      ),
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    selector: '.agent-override',
    property: Css.Color,
    value: '#00ff00',
  }),
})

export const removeOverrideStyleOp = defineOp<IRemoveComponentOverrideStyleData>()({
  name: 'removeOverrideStyle',
  command: CommandType.RemoveComponentOverrideStyle,
  title: 'Remove an override selector',
  description:
    'Delete a component-scoped selector and every style under it, across all breakpoints. ' +
    'To clear one property instead, call setOverrideStyle with no value.',
  input: obj({
    componentId: componentIdField(),
    selector: str().desc('Selector to remove entirely.'),
  }),
  derived: ['styles'],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const styles = component.style.overrides?.[input.selector]
    if (!styles) {
      constraint(
        `${component.id} has no override selector "${input.selector}". ` +
          'See read({components:[id],include:"overrides"}).',
      )
    }
    return {
      type: CommandType.RemoveComponentOverrideStyle,
      data: {
        componentId: component.id,
        selector: input.selector,
        styles: clone(styles),
      },
    }
  },
  example: (site) => ({
    componentId: exampleComponentId(site),
    selector: '.agent-override',
  }),
})

export const addComponentMixinOp = defineOp<IAddComponentMixinData>()({
  name: 'addComponentMixin',
  command: CommandType.AddComponentMixin,
  title: 'Apply a mixin to a component',
  description:
    'Attach a reusable style mixin to a component. Mixins apply below the component’s ' +
    'own styles, and later mixins in the list win over earlier ones.',
  input: obj({ componentId: componentIdField(), mixinId: mixinIdField() }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    const mixin = mustResolveMixin(ctx.site, input.mixinId)
    if (component.style.mixins?.includes(mixin.id)) {
      ctx.warn(`${component.id} already uses mixin ${mixin.id}`)
      return []
    }
    return {
      type: CommandType.AddComponentMixin,
      data: { componentId: component.id, mixinId: mixin.id },
    }
  },
  example: (site) => {
    const componentId = exampleComponentId(site)
    const mixins = site.context.components[componentId].style.mixins ?? []
    return {
      componentId,
      mixinId: site.context.styleOrder.find((id) => !mixins.includes(id)) as string,
    }
  },
})

export const removeComponentMixinOp = defineOp<IRemoveComponentMixinData>()({
  name: 'removeComponentMixin',
  command: CommandType.RemoveComponentMixin,
  title: 'Detach a mixin from a component',
  description:
    'Remove a style mixin from a component. The mixin itself is untouched; use ' +
    'removeMixin to delete it from the site.',
  input: obj({ componentId: componentIdField(), mixinId: mixinIdField() }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    if (!component.style.mixins?.includes(input.mixinId)) {
      constraint(`${component.id} does not use mixin ${input.mixinId}.`)
    }
    return {
      type: CommandType.RemoveComponentMixin,
      data: { componentId: component.id, mixinId: input.mixinId },
    }
  },
  example: (site) => {
    const componentId = exampleComponentId(site)
    return {
      componentId,
      mixinId: site.context.components[componentId].style.mixins?.[0] ?? '',
    }
  },
})

export const replaceComponentMixinOp = defineOp<IReplaceComponentMixinData>()({
  name: 'replaceComponentMixin',
  command: CommandType.ReplaceComponentMixin,
  title: 'Swap a component mixin',
  description:
    'Replace one mixin with another on a component, keeping its position in the mixin ' +
    'list so the cascade is unchanged.',
  input: obj({
    componentId: componentIdField(),
    oldMixinId: mixinIdField().desc('Mixin currently on the component.'),
    newMixinId: mixinIdField().desc('Mixin to use instead.'),
  }),
  derived: [],
  omitted: {},
  resolve: (ctx, input) => {
    const component = mustResolveComponent(ctx.site, input.componentId)
    mustResolveMixin(ctx.site, input.newMixinId)
    if (!component.style.mixins?.includes(input.oldMixinId)) {
      constraint(`${component.id} does not use mixin ${input.oldMixinId}.`)
    }
    return {
      type: CommandType.ReplaceComponentMixin,
      data: {
        componentId: component.id,
        oldMixinId: input.oldMixinId,
        newMixinId: input.newMixinId,
      },
    }
  },
  example: (site) => {
    const componentId = exampleComponentId(site)
    return {
      componentId,
      oldMixinId: site.context.components[componentId].style.mixins?.[0] ?? '',
      newMixinId: site.context.styleOrder[site.context.styleOrder.length - 1],
    }
  },
})
