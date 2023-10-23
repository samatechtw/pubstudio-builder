// Sets a record value and returns it if it exists, or creates a new record
export function setOrCreate<T>(
  obj: Record<string, T> | undefined,
  key: string | undefined,
  item: T | undefined,
): Record<string, T> | undefined {
  if (key === undefined) {
    return obj
  }
  if (obj) {
    if (!item) {
      delete obj[key]
    } else {
      obj[key] = item
    }
  } else if (item) {
    return { [key]: item }
  }
  return obj
}
