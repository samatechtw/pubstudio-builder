import { CssPseudoClass } from '@pubstudio/shared/type-site'

export const pseudoClassToCssClass = (pseudoClass: CssPseudoClass): string => {
  if (pseudoClass === CssPseudoClass.Default) {
    return ''
  }
  return pseudoClass.replace(/:/g, '_')
}
