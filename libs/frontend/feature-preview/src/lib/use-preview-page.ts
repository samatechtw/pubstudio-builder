import { restoreSiteHelper } from '@pubstudio/frontend/data-access-command'
import { checkSiteNeedsUpdate, store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { toApiError } from '@pubstudio/frontend/util-api'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { overrideHelper } from '@pubstudio/frontend/util-resolve'
import { INavigateOptions, useRouter } from '@pubstudio/frontend/util-router'
import { ref, Ref } from 'vue'
import { routeToPreviewPath } from './route-to-preview-path'

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
  const router = useRouter()

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
    try {
      const restored = await siteStore.value.restore(site.value.content_updated_at)
      setRestoredSite(restored)
      if (restored) {
        console.log('Site updated:', site.value.content_updated_at)
      } else {
        console.log('No site updates')
      }
    } catch (e) {
      const err = toApiError(e)
      if (err?.status === 401) {
        store.auth.refreshData()
      }
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
      // Override routing for behavior-helper to retain URL properties
      // like /preview prefix and ?siteId
      overrideHelper('push', (options: INavigateOptions) => {
        // TODO -- handle named routing
        if ('path' in options && options.path) {
          const path = routeToPreviewPath(options.path, RenderMode.Preview).url
          console.log('PATH', path)
          router.push({ path })
        }
      })
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
