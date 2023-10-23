// Return a new object without key/value pairs where value is in `values`
export function without<T>(object: Record<string, T>, ...values: T[]): Record<string, T> {
  const result: Record<string, T> = {}
  for (const [key, val] of Object.entries(object)) {
    if (!values.includes(val)) {
      result[key] = val
    }
  }
  return result
}
