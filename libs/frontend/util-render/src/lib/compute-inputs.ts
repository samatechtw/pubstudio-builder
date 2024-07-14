import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'

export const resolveInput = (
  context: ISiteContext,
  value: unknown,
  resolveTheme = true,
): unknown => {
  if (resolveTheme && typeof value === 'string') {
    return resolveThemeVariables(context, value, false) ?? value
  } else {
    return value
  }
}

interface IComputeInputOptions {
  onlyAttrs?: boolean
  resolveTheme?: boolean
}

export const computeInputs = (
  context: ISiteContext,
  component: IComponent,
  source: IComponent | undefined,
  options: IComputeInputOptions,
): Record<string, unknown> => {
  const attrs: Record<string, unknown> = {}
  const { onlyAttrs, resolveTheme } = options

  if (source?.inputs) {
    for (const [key, input] of Object.entries(source.inputs)) {
      if (!onlyAttrs || input.attr) {
        attrs[key] = resolveInput(context, input.is ?? input.default, resolveTheme)
      }
    }
  }

  if (component.inputs) {
    // If the component is a custom instance, only the overridden inputs will be in `c.inputs`.
    for (const [key, input] of Object.entries(component.inputs)) {
      if (!onlyAttrs || input.attr) {
        attrs[key] = resolveInput(context, input.is ?? input.default, resolveTheme)
      }
    }
  }
  return attrs
}
