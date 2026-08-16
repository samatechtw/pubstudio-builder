import { Css, CssPseudoClass, IBreakpointStyles } from '@pubstudio/shared/type-site'
import { breakpointIdField, cssPropertyField, pseudoClassField } from '../schema/fields'
import { arr, InferShape, obj, Schema, str } from '../schema/schema'

const styleEntryShape = {
  property: cssPropertyField(),
  value: str().desc('CSS value. May reference a theme variable as ${variable-name}.'),
  breakpointId: breakpointIdField(),
  pseudoClass: pseudoClassField(),
}

export type IStyleEntryInput = InferShape<typeof styleEntryShape>

export const styleEntriesField = (): Schema<IStyleEntryInput[] | undefined> =>
  arr(obj(styleEntryShape))
    .optional()
    .desc('Style entries to set, each scoped to one breakpoint and pseudo-class.')

export const toBreakpointStyles = (
  entries: IStyleEntryInput[] | undefined,
  defaultBreakpointId: string,
): IBreakpointStyles => {
  const styles: IBreakpointStyles = {}
  for (const entry of entries ?? []) {
    const breakpointId = entry.breakpointId ?? defaultBreakpointId
    const pseudoClass = entry.pseudoClass ?? CssPseudoClass.Default
    const pseudo = (styles[breakpointId] ??= {})
    const raw = (pseudo[pseudoClass] ??= {})
    raw[entry.property as Css] = entry.value
  }
  return styles
}
