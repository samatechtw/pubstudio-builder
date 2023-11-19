import { IInheritedStyleEntry, IStyleEntry } from '@pubstudio/shared/type-site'

export const omitSourceBreakpointId = (entry: IInheritedStyleEntry): IStyleEntry => ({
  pseudoClass: entry.pseudoClass,
  property: entry.property,
  value: entry.value,
})
