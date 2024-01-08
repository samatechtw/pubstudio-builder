import {
  GradientType,
  IGradientColor,
  IThemedGradient,
} from '@pubstudio/frontend/util-gradient'

export const computeGradient = (
  gradientType: GradientType,
  gradientDegree: number,
  gradientColors: IGradientColor[],
): IThemedGradient => {
  const degree = gradientType === GradientType.Linear ? `${gradientDegree}deg,` : ''
  const sorted = [...gradientColors].sort((a, b) => a.stop - b.stop)

  const colors = sorted
    .map((gradientColor) => {
      const { rgba, stop } = gradientColor
      return `${rgba} ${stop}%`
    })
    .join(',')
  const hasThemeVar = sorted.some((c) => !!c.themeVar)
  let themed: string | undefined = undefined
  if (hasThemeVar) {
    themed = sorted
      .map((gradientColor) => {
        const { themeVar, rgba, stop } = gradientColor
        const v = themeVar ? `$\{${themeVar}}` : undefined
        return `${v ?? rgba} ${stop}%`
      })
      .join(',')
  }

  return {
    raw: `${gradientType}(${degree}${colors})`,
    themed: themed ? `${gradientType}(${degree}${themed})` : undefined,
  }
}
