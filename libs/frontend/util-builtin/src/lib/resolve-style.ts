import { builtinThemeVariables, defaultContext } from '@pubstudio/frontend/util-ids'
import { ISiteContext, IStyle } from '@pubstudio/shared/type-site'
import { buttonStyle } from './components/builtin-button'
import { horizontalStyle } from './components/builtin-container-horizontal'
import { verticalStyle } from './components/builtin-container-vertical'
import {
  dividerHorizontalStyle,
  dividerVerticalStyle,
} from './components/builtin-divider'
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
import { captionedImageStyle, imageStyle } from './components/builtin-image'
import { inputStyle } from './components/builtin-input'
import { linkStyle } from './components/builtin-link'
import { listStyle } from './components/builtin-list'
import { navMenuItemStyle, navMenuStyle } from './components/builtin-nav-menu'
import { svgStyle } from './components/builtin-svg'
import { textStyle } from './components/builtin-text'
import { textareaStyle } from './components/builtin-textarea'

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
  [captionedImageStyle.id]: captionedImageStyle,
  [navMenuStyle.id]: navMenuStyle,
  [navMenuItemStyle.id]: navMenuItemStyle,
  [svgStyle.id]: svgStyle,
  [linkStyle.id]: linkStyle,
  [buttonStyle.id]: buttonStyle,
  [headerStyle.id]: headerStyle,
  [footerStyle.id]: footerStyle,
  [inputStyle.id]: inputStyle,
  [textareaStyle.id]: textareaStyle,
  [listStyle.id]: listStyle,
  [dividerHorizontalStyle.id]: dividerHorizontalStyle,
  [dividerVerticalStyle.id]: dividerVerticalStyle,
}

export const resolveStyle = (
  context: ISiteContext,
  styleId: string,
): IStyle | undefined => {
  let style: IStyle | undefined
  if (
    styleId.startsWith(context.namespace) ||
    styleId.startsWith(defaultContext.namespace)
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
): string | undefined => {
  try {
    return text.replace(themeVariableSyntaxRegex, (_, variableName: string) => {
      const value =
        // Custom theme variable
        context.theme.variables[variableName] ??
        // Builtin theme variable
        builtinThemeVariables[variableName as keyof typeof builtinThemeVariables]
      if (value === undefined) {
        console.warn(`Variable not found: ${variableName}`)
      }

      return value?.trim()
    })
  } catch (_e) {
    return undefined
  }
}
