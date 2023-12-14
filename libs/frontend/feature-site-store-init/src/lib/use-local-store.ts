import { store, WebStore } from '@pubstudio/frontend/data-access-web-store'
import { restoreSiteHelper } from '@pubstudio/frontend/feature-site-store'
import { serializeEditor, storeSite } from '@pubstudio/frontend/util-site-store'
import {
  IEditorContext,
  ISite,
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { ref } from 'vue'

type StoreKey = keyof Pick<WebStore, 'site' | 'scratchSite'>

let _storeName: StoreKey

export const useLocalStore = (storeName?: StoreKey): ISiteStore => {
  const siteId = ref(storeName === 'scratchSite' ? 'scratch' : '')
  const saveError = ref()

  // `storeName` must be included the first time `useLocalStore` is called
  if (storeName) {
    _storeName = storeName
  }

  const initialize = async () => {
    // No async initialization needed
  }

  const saveState = ref(SiteSaveState.Saved)

  const save = async (site: ISite) => {
    store[_storeName].setSite(storeSite(site))
  }
  const saveEditor = async (editor: IEditorContext) => {
    const serialized = serializeEditor(editor)
    store[_storeName].setEditor(serialized ? JSON.stringify(serialized) : null)
  }
  const restore = async (): Promise<ISiteRestore> => {
    return restoreSiteHelper(store[_storeName].getSite.value)
  }

  return { siteId, saveState, saveError, initialize, save, saveEditor, restore }
}
