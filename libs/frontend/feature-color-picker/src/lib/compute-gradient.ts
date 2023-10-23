import { GradientType, IGradientColor } from '@pubstudio/frontend/util-gradient'

export const computeLinearGradient = (
  gradientType: GradientType,
  gradientDegree: number,
  gradientColors: IGradientColor[],
): string => {
  const degree = gradientType === GradientType.Linear ? `${gradientDegree}deg,` : ''

  const colors = [...gradientColors]
    .sort((a, b) => a.stop - b.stop)
    .map((gradientColor) => {
      const { rgba, stop } = gradientColor
      return `${rgba} ${stop}%`
    })
    .join(',')

  return `${gradientType}(${degree}${colors})`
}

export const computeRadialGradient = (
  gradientType: GradientType,
  gradientColors: IGradientColor[],
): string => {
  const colors = [...gradientColors]
    .sort((a, b) => a.stop - b.stop)
    .map((gradientColor) => {
      const { rgba, stop } = gradientColor
      return `${rgba} ${stop}%`
    })
    .join(',')
  return `${gradientType}(${colors})`
}

export const computeConicGradient = (
  gradientType: GradientType,
  gradientColors: IGradientColor[],
): string => {
  const colors = [...gradientColors]
    .sort((a, b) => a.stop - b.stop)
    .map((gradientColor) => {
      const { rgba, stop } = gradientColor
      return `${rgba} ${stop}%`
    })
    .join(',')
  return `${gradientType}(${colors})`
}
