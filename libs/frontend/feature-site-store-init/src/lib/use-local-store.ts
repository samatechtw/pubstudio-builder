import { store, WebStore } from '@pubstudio/frontend/data-access-web-store'
import { restoreSiteHelper } from '@pubstudio/frontend/util-command'
import { serializeEditor, storeSite } from '@pubstudio/frontend/util-site-store'
import {
  IEditorContext,
  ISite,
  ISiteRestore,
  ISiteStore,
  IStoredSite,
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
    return undefined
  }

  const saveState = ref(SiteSaveState.Saved)

  const save = async (site: ISite) => {
    const stored = storeSite(site)
    const contentFields = ['defaults', 'context', 'pages']
    const currentSite = store[_storeName].getSite.value
    // Update site's content_updated_at if any content fields change
    for (const field of contentFields) {
      const k = field as keyof IStoredSite
      if (stored[k] !== currentSite[k]) {
        stored.content_updated_at = Date.now()
        break
      }
    }
    store[_storeName].setSite(stored)
  }
  const saveEditor = async (editor: IEditorContext) => {
    const serialized = serializeEditor(editor)
    store[_storeName].setEditor(serialized ? JSON.stringify(serialized) : null)
  }
  const restore = async (updateKey?: number): Promise<ISiteRestore | undefined> => {
    store[_storeName].refreshData()
    const restored = restoreSiteHelper(store[_storeName].getSite.value)
    if (updateKey && restored.site.content_updated_at === updateKey) {
      return undefined
    }
    return restored
  }

  return { siteId, saveState, saveError, initialize, save, saveEditor, restore }
}
