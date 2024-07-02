// Return true if arr2 exists and has different properties than arr1
export function arrayChanged<T>(arr1: T[] | undefined, arr2: T[] | undefined): boolean {
  return (
    arr1 === undefined ||
    arr2 === undefined ||
    arr1.length !== arr2.length ||
    !arr1.every((v, i) => arr2[i] === v)
  )
}
