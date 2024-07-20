import { CssPseudoClassType } from '@pubstudio/shared/type-site'

export const pseudoClassToCssClass = (pseudoClass: CssPseudoClassType): string => {
  if (pseudoClass === 'default') {
    return ''
  }
  return pseudoClass.replace(/:/g, '_')
}
