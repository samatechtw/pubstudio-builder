import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { Css, ISiteContext } from '@pubstudio/shared/type-site'

export const validateCssValue = (
  context: ISiteContext,
  property: Css,
  value: string,
): boolean => {
  const resolved = resolveThemeVariables(context, value)
  // TODO -- add font validation (for typos, etc)
  return property === Css.FontFamily || !resolved || CSS.supports(property, resolved)
}
