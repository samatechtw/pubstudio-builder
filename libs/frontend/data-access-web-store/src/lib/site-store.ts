// Site builder state
import { IStoredSite } from '@pubstudio/shared/type-site-store'
// Saves the current Site to local storage
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

export interface ISiteState extends IStoredSite {}

export const siteStoreGetters = (state: ISiteState) => ({
  getSite(): ISiteState {
    return state
  },
})

export const siteStoreMutations = (state: ISiteState) => ({
  setSite(newState: IStoredSite) {
    Object.assign(state, newState)
  },
  setName(name: string) {
    state.name = name
  },
  setVersion(version: string) {
    state.version = version
  },
  setDefaults(defaults: string) {
    state.defaults = defaults
  },
  setPages(pages: string) {
    state.pages = pages
  },
  setEditor(editor: string | null) {
    state.editor = editor
  },
})

export const siteModule = useModule<
  ISiteState,
  ReturnType<typeof siteStoreGetters>,
  ReturnType<typeof siteStoreMutations>
>({
  name: 'site-store',
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
