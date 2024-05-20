import { themeVariableSyntaxRegex } from '@pubstudio/frontend/util-resolve'
import { ComponentArgPrimitive, ComponentArgType } from '@pubstudio/shared/type-site'

export const validateComponentArg = (
  argType: ComponentArgType,
  value: unknown,
): boolean => {
  if (typeof value === 'string' && themeVariableSyntaxRegex.test(value)) {
    // TODO: should theme variable type be validated as well?
    return true
  } else if (argType === ComponentArgPrimitive.String) {
    return typeof value === 'string'
  } else if (argType === ComponentArgPrimitive.Number) {
    return validateNumber(value)
  } else if (argType === ComponentArgPrimitive.Boolean) {
    return validateBoolean(value)
  } else {
    // TODO: add the validation rules for other arg types on demand
    return true
  }
}

const validateNumber = (value: unknown): boolean => {
  const valueType = typeof value
  if (valueType === 'number') {
    return true
  }
  const number = Number(value)
  return !Number.isNaN(number)
}

const validateBoolean = (value: unknown): boolean => {
  const valueType = typeof value

  let isBoolean = valueType === 'boolean'

  if (!isBoolean && valueType === 'string') {
    const strValue = String(value).toLowerCase()
    isBoolean = ['true', 'false'].includes(strValue)
  }

  return isBoolean
}
