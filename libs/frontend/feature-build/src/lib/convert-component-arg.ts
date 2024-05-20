import { themeVariableSyntaxRegex } from '@pubstudio/frontend/util-resolve'
import { ComponentArgPrimitive, ComponentArgType } from '@pubstudio/shared/type-site'

export const convertComponentArg = (
  argType: ComponentArgType,
  value: string,
): unknown => {
  if (themeVariableSyntaxRegex.test(value)) {
    return value
  } else if (argType === ComponentArgPrimitive.String) {
    return value
  } else if (argType === ComponentArgPrimitive.Number) {
    return Number(value)
  } else if (argType === ComponentArgPrimitive.Boolean) {
    return convertBoolean(value)
  } else {
    // TODO: add the conversion rules for other arg type on demand
    return value
  }
}

const convertBoolean = (value: string): boolean => {
  const lowered = value.toLowerCase()
  if (lowered === 'true') {
    return true
  } else if (lowered === 'false') {
    return false
  } else {
    return !!value
  }
}
