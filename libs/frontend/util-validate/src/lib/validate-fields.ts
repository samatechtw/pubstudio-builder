/* eslint-disable @typescript-eslint/no-non-null-assertion */

// Standard field validation functions

type ErrorData = Record<string, string | number>

export type ValidateData = string | null | undefined

export interface ValidateError {
  key: string
  data: ErrorData
}

export type ValidateResult = ValidateError | undefined

export type Validator = (name: string, data: ValidateData) => ValidateResult

const e = (key: string, data: ErrorData) => ({
  key,
  data,
})

export const notNull = (name: string, data: ValidateData): ValidateResult =>
  data === undefined || data === null ? e('errors.null', { name }) : undefined

export const notEmpty = (name: string, data: ValidateData): ValidateResult =>
  notNull(name, data) || data!.length === 0 ? e('errors.null', { name }) : undefined

export const isNumber = (name: string, data: ValidateData): ValidateResult =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notNull(name, data) || isNaN(data as any) ? e('errors.number', { name }) : undefined

export const isInt = (name: string, data: ValidateData): ValidateResult =>
  isNumber(name, data) || !Number.isInteger(Number(data))
    ? e('errors.integer', { name })
    : undefined

export const lengthRange = (min: number, max: number) => {
  return (name: string, data: ValidateData): ValidateResult =>
    notNull(name, data) || data!.length < min || data!.length > max
      ? e('errors.range', { name, min, max })
      : undefined
}

export const numberRange = (min: number, max: number) => {
  return (name: string, data: ValidateData): ValidateResult => {
    const value = data === '' ? NaN : Number(data)
    return isNumber(name, data) || value < min || value > max
      ? e('errors.number_range', {
          name,
          min: min.toLocaleString(),
          max: max.toLocaleString(),
        })
      : undefined
  }
}

export const matches = (regex: RegExp) => {
  return (name: string, data: ValidateData): ValidateResult =>
    !regex.test(data ?? '') ? e('errors.matches', { name }) : undefined
}

export const isEmail = () => {
  return (name: string, data: ValidateData): ValidateResult =>
    lengthRange(3, 100)(name, data) || !data?.includes('@')
      ? e('errors.INVALID_VALUE.email', {})
      : undefined
}

export const checkError = (
  name: string,
  data: ValidateData,
  validators: Validator[],
): ValidateResult => {
  for (const validator of validators) {
    const error = validator(name, data)
    if (error) {
      return error
    }
  }
  return undefined
}
