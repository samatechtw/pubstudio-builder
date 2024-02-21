export const isNoWrapEllipsis = (componentId: string): boolean => {
  const element = document.getElementById(componentId)
  if (!element) {
    return false
  }
  const computedStyle = getComputedStyle(element)
  return (
    computedStyle.overflow === 'hidden' &&
    computedStyle.whiteSpace === 'nowrap' &&
    computedStyle.textOverflow === 'ellipsis'
  )
}
