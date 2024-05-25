import { ISiteContext } from '@pubstudio/shared/type-site'

export const defaultContext: ISiteContext = {
  namespace: 'global',
  nextId: 0,
  components: {},
  globalStyles: {},
  styles: {},
  styleOrder: [],
  reusableComponentIds: new Set(),
  reusableChildIds: new Set(),
  behaviors: {},
  theme: {
    variables: {},
    fonts: {},
  },
  breakpoints: {},
  i18n: {},
}
