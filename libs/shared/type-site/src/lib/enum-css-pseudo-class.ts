export enum CssPseudoClass {
  Default = 'default',
  Visited = ':visited',
  Focus = ':focus',
  Hover = ':hover',
  Enabled = ':enabled',
  Disabled = ':disabled',
  Checked = ':checked',
  Active = ':active',
  Placeholder = '::placeholder',
}

export type CssPseudoClassType = `${CssPseudoClass}`

export const CssPseudoClassValues: CssPseudoClass[] = Object.values(CssPseudoClass)
