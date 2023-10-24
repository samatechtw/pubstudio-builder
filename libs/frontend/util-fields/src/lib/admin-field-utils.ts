import { TFN } from '@pubstudio/frontend/type-ui-widgets'
import { SortDirection } from '@pubstudio/shared/type-sort'
import { IAdminSelectOption } from './i-admin-fields'

export type SelectEnum = {
  [id: string]: string
}

export interface IAdminFieldUtils {
  buildSelectOptions: <T extends SelectEnum>(
    key: string,
    values: T,
    excludes?: T[keyof T][],
  ) => IAdminSelectOption[]
  buildRawSelectOptions: <T extends SelectEnum>(
    values: T,
    excludes?: T[keyof T][],
  ) => IAdminSelectOption[]
  buildSortOptions: (keyPrefix: string, columns: string[]) => IAdminSelectOption[]
}

export const useAdminFieldUtils = (t: TFN): IAdminFieldUtils => {
  // Build select options from an Enum using i18n for display
  const buildSelectOptions = <T extends SelectEnum>(
    key: string,
    values: T,
    excludes?: T[keyof T][],
  ): IAdminSelectOption[] => {
    const excludedStrings = (excludes ?? [])?.map((x) => String(x))
    return Object.values(values)
      .filter((v) => v !== 'unknown' && !excludedStrings.includes(v))
      .map((v) => ({
        value: v,
        label: t(`${key}.${v}`),
      }))
  }

  // Build select options from an Enum without i18n
  const buildRawSelectOptions = <T extends SelectEnum>(
    values: T,
    excludes?: T[keyof T][],
  ): IAdminSelectOption[] => {
    const excludedStrings = (excludes ?? [])?.map((x) => String(x))
    return Object.values(values)
      .filter((v) => v !== 'unknown' && !excludedStrings.includes(v))
      .map((v) => ({
        value: v,
        label: v,
      }))
  }

  const buildSortOptions = (
    keyPrefix: string,
    columns: string[],
  ): IAdminSelectOption[] => {
    const options = Object.values(SortDirection).map((direction) =>
      columns.map((column) => {
        const key = `${column}.${direction}`
        return {
          key,
          label: t(`${keyPrefix}.${key}`),
          value: { column, direction },
        } as IAdminSelectOption
      }),
    )
    return options.flat()
  }

  return {
    buildSelectOptions,
    buildRawSelectOptions,
    buildSortOptions,
  }
}
