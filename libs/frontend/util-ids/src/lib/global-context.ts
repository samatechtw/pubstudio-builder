import { ISiteContext } from '@pubstudio/shared/type-site'

export const globalContext: ISiteContext = {
  namespace: 'global',
  nextId: 0,
  components: {},
  styles: {},
  behaviors: {},
  theme: {
    variables: {},
    fonts: {},
  },
  breakpoints: {},
  i18n: {},
}
