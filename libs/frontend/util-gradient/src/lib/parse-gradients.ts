import { GradientType, GradientTypeValues } from './enum-gradient-type'
import { IGradientColor } from './i-gradient-color'

export const parseGradientType = (gradient: string | undefined): GradientType => {
  if (gradient?.startsWith(GradientType.Conic)) {
    return GradientType.Conic
  } else if (gradient?.startsWith(GradientType.Radial)) {
    return GradientType.Radial
  } else {
    return GradientType.Linear
  }
}

export const parseGradientDegree = (gradient: string | undefined): number => {
  const value = gradient?.match(/\d+deg/)?.[0]
  return value ? parseInt(value) : 0
}

export const parseGradientColors = (gradient: string | undefined): IGradientColor[] => {
  const gradientColors: IGradientColor[] = []
  if (gradient) {
    const matches = gradient.matchAll(/rgb.*?%/g)
    for (const match of matches) {
      // i.e. "rgba(0, 0, 0, 1) 0%"
      const rgbaAndStop = match[0]
      const stopMatch = rgbaAndStop.match(/\d+%/)
      if (stopMatch) {
        const rgba = rgbaAndStop.substring(0, (stopMatch.index as number) - 1)
        const stop = stopMatch[0]
        if (CSS.supports('color', rgba)) {
          gradientColors.push({
            rgba,
            stop: parseInt(stop || '0'),
          })
        }
      }
    }
  }
  return gradientColors
}

export const isGradient = (cssValue: string | undefined): boolean => {
  return GradientTypeValues.some((gradientType) => cssValue?.startsWith(gradientType))
}
