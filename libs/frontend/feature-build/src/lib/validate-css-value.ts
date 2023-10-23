import { themeVariableSyntaxRegex } from '@pubstudio/frontend/util-builtin'
import { Css } from '@pubstudio/shared/type-site'

export const validateCssValue = (property: Css, value: string): boolean => {
  return !value || themeVariableSyntaxRegex.test(value) || CSS.supports(property, value)
}
