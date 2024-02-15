export const sanitizeCssClass = (cssClass: string): string => {
  return cssClass.replace(/[\s#]/g, '-')
}
