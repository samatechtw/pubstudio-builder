import {
  IBreakpointStyles,
  IComponent,
  IComponentEvents,
  IComponentInputs,
  IComponentStyleOverrides,
  IEditorEvents,
  IPseudoStyle,
  IResolvedComponentProps,
} from '@pubstudio/shared/type-site'
import { mergeRecord2 } from './helpers'

export const clone = <T>(object: T | undefined): T => {
  if (!object) {
    return object as T
  }
  return JSON.parse(JSON.stringify(object))
}

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
  const customStyles: IBreakpointStyles = clone(component.style.custom)

  let mixins = [...(component.style.mixins ?? [])]
  let inputs = clone(component.inputs)
  let events = clone(component.events)
  let editorEvents = clone(component.editorEvents)

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
    inputs = mergeRecord2(source.inputs, inputs) as IComponentInputs
    // Merge outputs
    events = mergeRecord2(source.events, events) as IComponentEvents
    // Merge editor events
    editorEvents = mergeRecord2(source.editorEvents, editorEvents) as IEditorEvents
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

export const detachOverrides = (
  component: IComponent,
  source: IComponent | undefined,
): IComponentStyleOverrides | undefined => {
  const sourceOverrides = source?.style.overrides
  if (!sourceOverrides || !component.children || !source.children) {
    return sourceOverrides ?? component.style.overrides
  }
  const overrides: IComponentStyleOverrides = {}
  for (const [key, override] of Object.entries(sourceOverrides)) {
    // Get index of child the original override applied to
    const childIndex = source.children.findIndex((cmp) => cmp.id === key)

    const overrideCopy = JSON.parse(JSON.stringify(override))
    if (childIndex === -1) {
      // Override does not correspond to a child, copy it directly
      overrides[key] = clone(overrideCopy)
    } else {
      // Copy the override to the new component, using the new child ID as key
      overrides[component.children[childIndex].id] = clone(overrideCopy)
    }
  }
  return overrides
}
