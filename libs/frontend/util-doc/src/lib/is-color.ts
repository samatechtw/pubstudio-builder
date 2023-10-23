export const isColor = (color: string): boolean => {
  const style = new Option().style
  style.color = color
  return style.color !== ''
}
