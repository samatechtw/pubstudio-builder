export const isColor = (color: string): boolean => {
  return CSS.supports('color', color)
}
