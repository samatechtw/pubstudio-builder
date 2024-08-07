import { restoreSiteHelper } from '@pubstudio/frontend/data-access-command'
import { checkSiteNeedsUpdate, store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { ref, Ref } from 'vue'

export interface IUsePreviewPage {
  loading: Ref<boolean>
  checkOutdated: () => Promise<void>
  previewMounted: () => Promise<InitializeResult>
  previewUnmounted: () => void
}

export enum InitializeResult {
  Success = 0,
  Unauthorized = 1,
}

// Number of seconds to wait to reload from the API, if no local changes are detected
const API_RESTORE_TIMEOUT = 5

export const usePreviewPage = (siteId: string | undefined): IUsePreviewPage => {
  const { site, siteStore, setRestoredSite } = useSiteSource()

  const loading = ref(true)
  let apiRestoreCounter = 0
  let checkInterval: ReturnType<typeof setInterval> | undefined

  const restoreLocal = (contentUpdatedAt: number) => {
    store.site.refreshData()
    const restored = restoreSiteHelper(store.site.getSite.value)
    // TODO -- this is necessary because we don't save content_updated_at with the site, since the API
    // doesn't expect it in the save/update request. It probably makes sense to include in the request,
    // so we can remove this
    restored.site.content_updated_at = contentUpdatedAt
    setRestoredSite(restored)
  }

  const checkOutdated = async () => {
    if (!site.value) {
      return
    }
    // Check local storage to check for updates in this browser session
    const newContentUpdatedAt = checkSiteNeedsUpdate(site.value.content_updated_at)
    if (newContentUpdatedAt) {
      restoreLocal(newContentUpdatedAt)
      apiRestoreCounter = 7
      return
    }
    apiRestoreCounter -= 1
    if (apiRestoreCounter > 0) {
      return
    }
    // If not updated locally for more than 5 seconds, check the API
    const restored = await siteStore.value.restore(site.value.content_updated_at)
    setRestoredSite(restored)
    if (restored) {
      console.log('Site updated:', site.value.content_updated_at)
    } else {
      console.log('No site updates')
    }
    apiRestoreCounter = API_RESTORE_TIMEOUT
  }

  const pollOutdated = () => {
    if (!document.hidden) {
      checkOutdated()
    }
  }

  const previewMounted = async (): Promise<InitializeResult> => {
    apiRestoreCounter = API_RESTORE_TIMEOUT
    checkInterval = setInterval(checkOutdated, 1000)
    document.addEventListener('visibilitychange', pollOutdated)
    try {
      await initializeSiteStore({ siteId })
    } catch (err) {
      console.log('Preview load fail:', err)
      const e = err as Record<string, unknown>
      if ('status' in e && e.status === 401) {
        return InitializeResult.Unauthorized
      }
    }
    loading.value = false
    return InitializeResult.Success
  }

  const previewUnmounted = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
    }
    document.removeEventListener('visibilitychange', pollOutdated)
  }

  return { loading, checkOutdated, previewMounted, previewUnmounted }
}
