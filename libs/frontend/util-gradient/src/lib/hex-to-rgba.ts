import { IRgba } from './i-rgba'

// Converts 3/4 char hex to 6/8 char, and adds # if not present
export function normalizeHex(hex: string): string | undefined {
  if (!/^#?[0-9A-Fa-f]{3,}$/g.test(hex)) {
    return undefined
  }
  const h = hex.startsWith('#') ? hex.slice(1) : hex
  const len = h ? h.length : 0
  if (len === 3 || len === 4) {
    return '#' + Array.from(h).reduce((prev, cur) => `${prev}${cur}${cur}`, '')
  }
  return `#${h}`
}

const toNum = (hex: string, start: number, end: number) =>
  parseInt(hex.slice(start, end), 16)

/**
 * Converts 3 and 4 char hex strings to 6 or 8 char string
 * Validates proper hex-ness
 */
export function hexToRgba(hex: string): IRgba | undefined {
  const norm = normalizeHex(hex)
  if (norm) {
    return {
      r: toNum(norm, 1, 3),
      g: toNum(norm, 3, 5),
      b: toNum(norm, 5, 7),
    }
  }
  return undefined
}
