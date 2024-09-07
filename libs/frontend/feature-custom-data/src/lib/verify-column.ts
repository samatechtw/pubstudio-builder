import { IEditTableColumn } from './i-edit-column'

export const verifyColumn = (info: IEditTableColumn): string | undefined => {
  if (info.name.length < 1 || info.name.length > 50) {
    return 'errors.column_name'
  } else if ((info.default?.length ?? 0) > 50) {
    return 'errors.column_default'
  }
  for (const validator of Object.values(info.validators)) {
    const { rule_type, parameter } = validator
    if (['MinLength', 'MaxLength'].includes(rule_type) && !parameter) {
      return 'errors.column_param'
    } else if (parameter && Number.isNaN(parseInt(parameter))) {
      return 'errors.column_param'
    }
  }
  const min = info.validators.MinLength?.parameter
    ? parseInt(info.validators.MinLength.parameter)
    : undefined
  const max = info.validators.MinLength?.parameter
    ? parseInt(info.validators.MinLength.parameter)
    : undefined
  if (min && max && min > max) {
    return 'errors.min_max'
  }
  return undefined
}
