export const exactlyOneDefined = (items: Array<unknown | undefined>): boolean => {
  return items.filter((item) => item !== undefined).length === 1
}
