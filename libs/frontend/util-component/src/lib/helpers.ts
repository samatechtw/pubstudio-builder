import {
  IComponentEvents,
  IComponentInputs,
  IComponentStyle,
} from '@pubstudio/shared/type-site'

export const mergeArr = <T>(
  arr1: T[] | undefined,
  arr2: T[] | undefined,
): T[] | undefined => {
  if (arr1 && arr2) {
    return [...arr1, ...arr2]
  }
  if (arr1) {
    return [...arr1]
  }
  return arr2 ? [...arr2] : undefined
}

export const cloneRecord = <T>(
  record: Record<string, T> | undefined,
): Record<string, T> | undefined => {
  return record ? { ...record } : undefined
}

// Merges two records, doing a deep copy of the first if it exists
export const mergeRecord2 = <T extends IComponentInputs | IComponentEvents>(
  record1: T | undefined,
  record2: T | undefined,
): T | undefined => {
  if (!record1) {
    return record2 ? { ...record2 } : undefined
  }
  const result: T = {} as T
  for (const [key, value] of Object.entries(record1)) {
    result[key] = { ...value }
  }
  if (record2) {
    for (const [key, value] of Object.entries(record2)) {
      result[key] = { ...value }
    }
  }
  return result
}

export const cloneStyle = (style: IComponentStyle): IComponentStyle => {
  return {
    custom: structuredClone(style.custom),
    mixins: style.mixins ? [...style.mixins] : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const omit = <T extends Record<string, any>, K extends keyof T>(
  target: T,
  key: K,
): Omit<T, K> => {
  const obj = { ...target }
  delete obj[key]
  return obj
}
