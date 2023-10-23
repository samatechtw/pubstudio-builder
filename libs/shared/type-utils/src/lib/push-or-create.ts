// Pushes a value to an array and returns it if it exists, or creates a new array
export function pushOrCreate<T>(arr: T[] | undefined, item: T): T[] {
  if (arr) {
    arr.push(item)
    return arr
  } else {
    return [item]
  }
}
