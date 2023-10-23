export type CssValue = number | 'auto' | 'unset'
export type CssArr = [CssValue, CssValue, CssValue, CssValue]

export function serializeSides(sides: CssArr): string {
  return sides
    .map((v) => {
      if (v === 'auto' || v === 'unset') {
        return v
      } else {
        return `${v}px`
      }
    })
    .join(' ')
}

export function stringToCssValue(v: string): CssValue {
  if (v === 'auto' || v === 'unset') {
    return v
  }
  const parsed = parseInt(v)
  return Number.isNaN(parsed) ? 0 : parsed
}

// Parses CSS padding or margin to array
// Returns [0, 0, 0, 0] if parsing fails
export function parseSides(value: string | undefined): CssArr {
  if (value === undefined) {
    return [0, 0, 0, 0]
  }

  const sides = value.replace('!important', '').trim().split(/\s+/)

  if (sides.length < 1 || sides.length > 4) {
    return [0, 0, 0, 0]
  }
  const top = stringToCssValue(sides[0])
  const right = sides[1] ? stringToCssValue(sides[1]) : top
  const bottom = sides[2] ? stringToCssValue(sides[2]) : top
  const left = sides[3] ? stringToCssValue(sides[3]) : right

  return [top, right, bottom, left]
}
