import {
  IBreakpointStyles,
  IComponent,
  IPseudoStyle,
  IResolvedComponentProps,
} from '@pubstudio/shared/type-site'
import { mergeRecord2 } from './helpers'

// Copies inherited custom style object and merges it into a component custom style
export const generateCustomStyle = (
  custom: IPseudoStyle,
  source: IPseudoStyle,
): IPseudoStyle => {
  for (const k in source) {
    const key = k as keyof typeof source
    if (source[key]) {
      custom[key] = { ...source[key], ...custom[key] }
    }
  }
  return custom
}

// Merge component fields with those inherited from source
export const resolveComponentProps = (
  component: IComponent,
  source: IComponent,
): IResolvedComponentProps => {
  const customStyles: IBreakpointStyles = structuredClone(component.style.custom)

  let mixins = component.style.mixins ?? []
  let inputs = component.inputs
  let events = component.events
  let editorEvents = component.editorEvents

  if (source !== undefined) {
    // Collect mixins
    if (source.style.mixins) {
      mixins.push(...source.style.mixins)
    }
    // Merge custom styles
    for (const breakpointId in source.style.custom) {
      customStyles[breakpointId] = generateCustomStyle(
        component.style.custom[breakpointId] ?? {},
        source.style.custom[breakpointId] ?? {},
      )
    }
    // Merge inputs
    inputs = mergeRecord2(source.inputs, inputs)
    // Merge outputs
    events = mergeRecord2(source.events, events)
    // Merge editor events
    editorEvents = mergeRecord2(source.editorEvents, editorEvents)
  }
  // De-duplicate mixins
  mixins = Array.from(new Set(mixins))
  const style = { custom: customStyles, mixins: mixins.length === 0 ? undefined : mixins }
  return { style, inputs, events, editorEvents }
}

export const detachComponent = (
  component: IComponent,
  source: IComponent,
): IComponent => {
  const { style, inputs, events, editorEvents } = resolveComponentProps(component, source)
  component.style = style
  component.inputs = inputs
  component.events = events
  component.editorEvents = editorEvents
  return component
}
