import { GradientType, GradientTypeValues } from './enum-gradient-type'
import { hexToRgba } from './hex-to-rgba'
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

export type ResolveThemeVarFn = (themeVar: string) => string | undefined

export const parseGradientColors = (
  gradient: string | undefined,
  resolveThemeVar?: ResolveThemeVarFn,
): IGradientColor[] => {
  const gradientColors: IGradientColor[] = []
  if (gradient) {
    // Parse rgba
    const matches = gradient.matchAll(/rgb.*?%/g)
    for (const match of matches) {
      // "rgba(0, 0, 0, 1) 0%"
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
    // Parse hex
    const hexMatches = gradient.matchAll(/#.*?%/g)
    for (const match of hexMatches) {
      // #111111 %0
      const hexAndStop = match[0]
      const stopMatch = hexAndStop.match(/\d+%/)
      if (stopMatch) {
        const hex = hexAndStop.substring(0, (stopMatch.index as number) - 1)
        const stop = stopMatch[0]
        const c = hexToRgba(hex)
        if (CSS.supports('color', hex) && c) {
          const rgba = `rgba(${c.r},${c.g},${c.b})`
          gradientColors.push({
            rgba,
            stop: parseInt(stop || '0'),
          })
        }
      }
    }
    // Parse theme variables
    const varMatches = gradient.matchAll(/\$\{.*?\}.*?%/g)
    for (const match of varMatches) {
      // #111111 %0
      const hexAndStop = match[0]
      const stopMatch = hexAndStop.match(/\d+%/)
      if (stopMatch) {
        const themeVar = hexAndStop.substring(0, (stopMatch.index as number) - 1)
        const stop = stopMatch[0]
        let colorStr = resolveThemeVar?.(themeVar) ?? ''
        if (colorStr?.startsWith('#')) {
          const c = hexToRgba(colorStr)
          if (c) {
            colorStr = `rgba(${c.r},${c.g},${c.b})`
          }
        }
        if (CSS.supports('color', colorStr)) {
          gradientColors.push({
            rgba: colorStr,
            stop: parseInt(stop || '0'),
            themeVar: themeVar.slice(2, themeVar.length - 1),
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

export const isTextGradient = (
  background: string | undefined,
  backgroundClip: string | undefined,
  textFillColor: string | undefined,
): boolean => {
  const gradientApplied = GradientTypeValues.some(
    (gradientType) => background?.startsWith(gradientType),
  )
  return gradientApplied && backgroundClip === 'text' && textFillColor === 'transparent'
}
