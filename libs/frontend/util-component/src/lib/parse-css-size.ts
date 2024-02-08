export type CssSizeUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'auto' | '-'

export interface ICssSize {
  value: string
  unit: CssSizeUnit
}

export const CssSizeUnits: CssSizeUnit[] = [
  'px',
  '%',
  'em',
  'rem',
  'vw',
  'vh',
  'auto',
  '-',
]
export const CssSizeRegex = new RegExp(
  `^([0-9.]*)((?:${CssSizeUnits.join(')|(?:')}))$`,
  'i',
)

export const parseCssSize = (
  str: string | undefined,
  defaultUnit: CssSizeUnit,
): ICssSize => {
  if (str === '0') {
    return { value: '0', unit: defaultUnit }
  }
  const matches = (str ?? '').match(CssSizeRegex)
  const unit = (matches?.[2] ?? '-') as CssSizeUnit
  const value = matches?.[1] ?? ''
  return { value, unit }
}
