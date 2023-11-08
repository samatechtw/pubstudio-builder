import {
  builtinFonts,
  builtinThemeVariables,
  globalContext,
} from '@pubstudio/frontend/util-ids'
import { ISiteContext, IStyle } from '@pubstudio/shared/type-site'
import { buttonStyle } from './components/builtin-button'
import { horizontalStyle } from './components/builtin-container-horizontal'
import { verticalStyle } from './components/builtin-container-vertical'
import { footerStyle } from './components/builtin-footer'
import {
  h1Style,
  h2Style,
  h3Style,
  h4Style,
  h5Style,
  h6Style,
} from './components/builtin-h'
import { headerStyle } from './components/builtin-header'
import { imageStyle } from './components/builtin-image'
import { inputStyle } from './components/builtin-input'
import { linkStyle } from './components/builtin-link'
import { navMenuItemStyle, navMenuStyle } from './components/builtin-nav-menu'
import { textStyle } from './components/builtin-text'
import { parseId } from './resolve'

export const builtinStyles: Record<string, IStyle> = {
  [horizontalStyle.id]: horizontalStyle,
  [verticalStyle.id]: verticalStyle,
  [textStyle.id]: textStyle,
  [h1Style.id]: h1Style,
  [h2Style.id]: h2Style,
  [h3Style.id]: h3Style,
  [h4Style.id]: h4Style,
  [h5Style.id]: h5Style,
  [h6Style.id]: h6Style,
  [imageStyle.id]: imageStyle,
  [navMenuStyle.id]: navMenuStyle,
  [navMenuItemStyle.id]: navMenuItemStyle,
  [linkStyle.id]: linkStyle,
  [buttonStyle.id]: buttonStyle,
  [headerStyle.id]: headerStyle,
  [footerStyle.id]: footerStyle,
  [inputStyle.id]: inputStyle,
}

export const resolveStyle = (
  context: ISiteContext,
  styleId: string,
): IStyle | undefined => {
  const { namespace } = parseId(styleId)
  let style: IStyle | undefined
  if (namespace === context.namespace || namespace === globalContext.namespace) {
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
): string | undefined => {
  try {
    return text.replace(themeVariableSyntaxRegex, (_, variableName: string) => {
      const value =
        // Custom theme variable
        context.theme.variables[variableName] ??
        // Builtin theme variable
        builtinThemeVariables[variableName as keyof typeof builtinThemeVariables] ??
        // Builtin font
        builtinFonts[variableName as keyof typeof builtinFonts]

      if (value === undefined) {
        console.warn(`Variable not found: ${variableName}`)
      }

      return value
    })
  } catch (_e) {
    return undefined
  }
}
