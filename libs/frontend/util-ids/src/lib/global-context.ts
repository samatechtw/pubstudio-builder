import { ISiteContext } from '@pubstudio/shared/type-site'

export const makeContext = (namespace: string): ISiteContext => {
  return {
    namespace,
    nextId: 0,
    components: {},
    globalStyles: {},
    styles: {},
    styleOrder: [],
    customComponentIds: new Set(),
    customChildIds: new Set(),
    behaviors: {},
    theme: {
      variables: {},
      fonts: {},
    },
    breakpoints: {},
    i18n: {},
  }
}

export const globalContext = makeContext('global')
