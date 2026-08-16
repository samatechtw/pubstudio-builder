import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ISetComponentCustomStyleData,
  ISetComponentOverrideStyleData,
  ISetMixinEntryData,
} from '@pubstudio/shared/type-command-data'
import {
  Css,
  CssPseudoClassType,
  IComponent,
  IStyle,
  IStyleEntry,
} from '@pubstudio/shared/type-site'

// A style location without a value; identifies the entry to read or write
export type IStyleTarget = Omit<IStyleEntry, 'value'>

export const componentStyleValue = (
  component: IComponent,
  breakpointId: string,
  target: IStyleTarget,
): string | undefined =>
  component.style.custom[breakpointId]?.[target.pseudoClass]?.[target.property]

export const componentOverrideStyleValue = (
  component: IComponent,
  selector: string,
  breakpointId: string,
  target: IStyleTarget,
): string | undefined =>
  component.style.overrides?.[selector]?.[breakpointId]?.[target.pseudoClass]?.[
    target.property
  ]

export const mixinStyleValue = (
  mixin: IStyle,
  breakpointId: string,
  target: IStyleTarget,
): string | undefined =>
  mixin.breakpoints[breakpointId]?.[target.pseudoClass]?.[target.property]

const styleEntry = (
  target: IStyleTarget,
  value: string | undefined,
): IStyleEntry | undefined => (value === undefined ? undefined : { ...target, value })

// Set or clear a component's own style entry. Passing `undefined` for `value` removes it.
export const makeSetComponentCustomStyleData = (
  component: IComponent,
  breakpointId: string,
  target: IStyleTarget,
  value: string | undefined,
  select?: boolean,
): ISetComponentCustomStyleData => ({
  componentId: component.id,
  breakpointId,
  select,
  oldStyle: styleEntry(target, componentStyleValue(component, breakpointId, target)),
  newStyle: styleEntry(target, value),
})

export const makeSetComponentCustomStyle = (
  component: IComponent,
  breakpointId: string,
  prop: Css,
  value: string | undefined,
  pseudoClass: CssPseudoClassType = 'default',
): ICommand<ISetComponentCustomStyleData> => ({
  type: CommandType.SetComponentCustomStyle,
  data: makeSetComponentCustomStyleData(
    component,
    breakpointId,
    { pseudoClass, property: prop },
    value,
  ),
})

export const makeSetComponentOverrideStyleData = (
  component: IComponent,
  selector: string,
  breakpointId: string,
  target: IStyleTarget,
  value: string | undefined,
): ISetComponentOverrideStyleData => ({
  componentId: component.id,
  selector,
  breakpointId,
  oldStyle: styleEntry(
    target,
    componentOverrideStyleValue(component, selector, breakpointId, target),
  ),
  newStyle: styleEntry(target, value),
})

export const makeSetMixinEntryData = (
  mixin: IStyle,
  breakpointId: string,
  target: IStyleTarget,
  value: string | undefined,
): ISetMixinEntryData => ({
  mixinId: mixin.id,
  breakpointId,
  oldStyle: styleEntry(target, mixinStyleValue(mixin, breakpointId, target)),
  newStyle: styleEntry(target, value),
})
