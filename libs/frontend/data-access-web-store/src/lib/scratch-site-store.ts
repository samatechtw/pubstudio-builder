// Site store for the "scratch" site, which is separated so it's not overwritten
// by other sites. This site is not synced to any API.

import { LocalStoragePlugin, useModule } from '@samatech/vue-store'
import { ISiteState, siteStoreGetters, siteStoreMutations } from './site-store'

export const scratchSiteModule = useModule<
  ISiteState,
  ReturnType<typeof siteStoreGetters>,
  ReturnType<typeof siteStoreMutations>
>({
  name: 'scratch-site-store',
  version: 1,
  stateInit: () => ({
    name: null,
    version: null,
    defaults: null,
    context: null,
    pages: null,
    history: null,
    editor: null,
  }),
  getters: siteStoreGetters,
  mutations: siteStoreMutations,
  plugins: [LocalStoragePlugin],
})
