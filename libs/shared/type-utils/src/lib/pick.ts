export function pick<T extends object, U extends keyof T>(
  object: T,
  keys: Array<U>,
): Pick<T, U> {
  const newObject = {} as Pick<T, U>
  for (const key of keys) {
    if (key in object) {
      if (key in object) {
        newObject[key] = object[key]
      }
    }
  }
  return newObject
}
