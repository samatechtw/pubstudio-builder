import { IRgba } from '@pubstudio/frontend/util-gradient'
import { IPickerColor } from './i-picker-color'

export function setColorValue(color: string | IRgba) {
  let rgba: IRgba = { r: 0, g: 0, b: 0, a: 1 }
  if (typeof color === 'string') {
    if (/#/.test(color)) {
      rgba = hex2rgb(color)
    } else if (/rgb/.test(color)) {
      rgba = rgb2rgba(color)
    } else if (/\d/.test(color)) {
      rgba = rgb2rgba(`rgba(${color})`)
    } else {
      const rgbaString = colorCodeToRgbaString(color)
      rgba = rgb2rgba(rgbaString)
    }
  } else if (Object.prototype.toString.call(color) === '[object Object]') {
    rgba = color
  }
  const { r, g, b, a } = rgba
  const { h, s, v } = rgb2hsv(rgba)
  return { r, g, b, a: a === undefined ? 1 : a, h, s, v }
}
export function createAlphaSquare(size: number) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Fail to get 2d context from canvas')
  }
  const doubleSize = size * 2
  canvas.width = doubleSize
  canvas.height = doubleSize

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, doubleSize, doubleSize)
  ctx.fillStyle = '#ccd5db'
  ctx.fillRect(0, 0, size, size)
  ctx.fillRect(size, size, size, size)

  return canvas
}

type IDirection = 'l' | 'r' | 'p'

export function createLinearGradient(
  direction: IDirection,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color1: string,
  color2: string,
) {
  // l horizontal p vertical
  const isL = direction === 'l'
  const gradient = ctx.createLinearGradient(0, 0, isL ? width : 0, isL ? 0 : height)
  gradient.addColorStop(0.01, color1)
  gradient.addColorStop(0.99, color2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function rgb2hex({ r, g, b }: IRgba, toUpper: boolean) {
  const change = (val: number) => ('0' + Number(val).toString(16)).slice(-2)
  const color = `#${change(r)}${change(g)}${change(b)}`
  return toUpper ? color.toUpperCase() : color
}

export function hex2rgb(hex: string): IRgba {
  hex = hex.slice(1)
  const change = (val: string) => parseInt(val, 16) || 0 // Avoid NaN situations
  return {
    r: change(hex.slice(0, 2)),
    g: change(hex.slice(2, 4)),
    b: change(hex.slice(4, 6)),
  }
}

export function rgb2rgba(rgba: string): IRgba {
  const rgbaArr = (/rgba?\((.*?)\)/.exec(rgba) || ['', '0,0,0,1'])[1].split(',')
  return {
    r: Number(rgbaArr[0]) || 0,
    g: Number(rgbaArr[1]) || 0,
    b: Number(rgbaArr[2]) || 0,
    a: Number(rgbaArr[3] ? rgbaArr[3] : 1), // Avoid the case of 0
  }
}

export function rgb2hsv({ r, g, b }: IRgba) {
  r = r / 255
  g = g / 255
  b = b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (max === min) {
    h = 0
  } else if (max === r) {
    if (g >= b) {
      h = (60 * (g - b)) / delta
    } else {
      h = (60 * (g - b)) / delta + 360
    }
  } else if (max === g) {
    h = (60 * (b - r)) / delta + 120
  } else if (max === b) {
    h = (60 * (r - g)) / delta + 240
  }
  h = Math.floor(h)
  const s = parseFloat((max === 0 ? 0 : 1 - min / max).toFixed(2))
  const v = parseFloat(max.toFixed(2))
  return { h, s, v }
}

// Convert "red", "blue", "#ff0000", "rgb(255, 0, 0)", or "rgba(255, 0, 0, 0.5)" to rgba value.
export const colorCodeToRgbaString = (color: string): string => {
  const span = document.createElement('span')
  span.style.color = color

  document.body.appendChild(span)
  const rgba = getComputedStyle(span).color

  document.body.removeChild(span)
  return rgba
}

// Convert IPickerColor to a CSS string value or theme variable that can be rendered
export const colorToCssValue = (
  pickerColor: IPickerColor | undefined,
  useCssVar: boolean,
): string | undefined => {
  if (pickerColor === undefined) {
    return undefined
  }
  if (pickerColor.themeVar) {
    if (useCssVar) {
      return `var(--${pickerColor.themeVar})`
    } else {
      return `$\{${pickerColor.themeVar}}`
    }
  } else {
    const c = pickerColor.rgba
    return c ? `rgba(${c.r},${c.g},${c.b},${c.a})` : undefined
  }
}
