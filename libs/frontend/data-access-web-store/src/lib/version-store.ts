// Stores information about the site version
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

export interface IVersionState {
  activeVersionId: string | null
}

export const versionStoreGetters = (state: IVersionState) => ({
  activeVersionId(): string | null {
    return state.activeVersionId
  },
  editingEnabled(): boolean {
    return !state.activeVersionId
  },
})

export const versionStoreMutations = (state: IVersionState) => ({
  setActiveVersion(newVersion: string | undefined | null) {
    state.activeVersionId = newVersion ?? null
  },
})

export const versionModule = useModule<
  IVersionState,
  ReturnType<typeof versionStoreGetters>,
  ReturnType<typeof versionStoreMutations>
>({
  name: 'version-store',
  version: 1,
  stateInit: () => ({
    activeVersionId: null,
  }),
  getters: versionStoreGetters,
  mutations: versionStoreMutations,
  plugins: [LocalStoragePlugin],
})
