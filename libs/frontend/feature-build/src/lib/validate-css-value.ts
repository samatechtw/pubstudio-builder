import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { Css, ISiteContext } from '@pubstudio/shared/type-site'

export const validateCssValue = (
  context: ISiteContext,
  property: Css,
  value: string,
): boolean => {
  const resolved = resolveThemeVariables(context, value)
  return !resolved || CSS.supports(property, resolved)
}
