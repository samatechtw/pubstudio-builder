import { globalContext } from '@pubstudio/frontend/util-defaults'
import { ISiteContext, IStyle } from '@pubstudio/shared/type-site'

export const resolveStyle = (
  context: ISiteContext,
  styleId: string,
): IStyle | undefined => {
  let style: IStyle | undefined
  if (
    styleId.startsWith(context.namespace) ||
    styleId.startsWith(globalContext.namespace)
  ) {
    style = context.styles[styleId]
  } else {
    // TODO -- resolve external namespaces
  }
  return style
}

// For example, ${color-text}
export const themeVariableSyntaxRegex = /\$\{(.*?)\}/g

export const resolveThemeVariables = (
  context: ISiteContext,
  text: string,
  trim = true,
): string | undefined => {
  try {
    const resolved = text.replace(themeVariableSyntaxRegex, (_, variableName: string) => {
      const value =
        // Custom theme variable
        context.theme.variables[variableName]
      if (value === undefined) {
        console.warn(`Variable not found: ${variableName}`)
      }

      return value
    })

    if (trim) {
      return resolved.trim()
    } else {
      return resolved
    }
  } catch (_e) {
    return undefined
  }
}
