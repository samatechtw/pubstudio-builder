import { usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { IApiSite, useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { site } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { IApiError } from '@pubstudio/shared/type-api'
import { SiteVariant } from '@pubstudio/shared/type-api-platform-site'
import { ISiteInfoViewModel } from '@pubstudio/shared/type-api-site-sites'
import { computed, ComputedRef, inject, Ref, ref } from 'vue'
import { VersionOption } from './enum-version-option'

export interface IUseSiteVersion {
  hasVersions: Ref<boolean>
  versions: Ref<ISiteInfoViewModel[]>
  hasDraft: ComputedRef<boolean>
  sitePublished: ComputedRef<boolean>
  activeVersionId: Ref<string | null | undefined>
  loading: Ref<boolean>
  error: Ref<string | undefined>
  listVersions: () => Promise<void>
  enablePreview: (enable: boolean) => Promise<void>
  createDraft: () => Promise<void>
  deleteDraft: () => Promise<void>
  publishSite: () => Promise<void>
  setActiveVersion: (version: VersionOption) => Promise<void>
}

export interface IUseSiteVersionOptions {
  siteId: string | undefined
}

const versions = ref<ISiteInfoViewModel[]>([])
const hasVersions = ref<boolean>(false)
let siteId: string | undefined = undefined
let api: IApiSite

const hasDraft = computed(() => {
  return hasVersions.value && versions.value.length > 1 && !versions.value[0]?.published
})

const sitePublished = computed(() => {
  return versions.value.some((v) => v.published)
})

export const useSiteVersion = (options?: IUseSiteVersionOptions): IUseSiteVersion => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const { siteStore, setRestoredSite, syncUpdateKey, apiSite } = useSiteSource()
  if (options) {
    siteId = options.siteId
  }
  if (!api && apiSite) {
    api = useSiteApi(apiSite)
  }
  const loading = ref(false)
  const error = ref()

  const listVersions = async () => {
    hasVersions.value = !(siteId === SiteVariant.Local || siteId === SiteVariant.Scratch)
    if (api && hasVersions.value) {
      try {
        versions.value = await api.listSiteVersions(siteId as string)
      } catch (e) {
        console.log('Failed to list site versions', e)
        const err = e as IApiError
        if (err.status === 401) {
          store.auth.setLoginRedirect(location.pathname)
          store.auth.logOut()
        }
      }
    }
  }

  const enablePreview = async (enable: boolean) => {
    loading.value = true
    try {
      const res = await api.updateSite(siteId as string, { enable_preview: enable })
      syncUpdateKey(res)
    } catch (e) {
      console.log(`Failed to set preview ${enable}`, e)
      error.value = parseApiErrorKey(toApiError(e))
    }
    loading.value = false
  }

  const createDraft = async () => {
    error.value = undefined
    const { siteStore } = useSiteSource()
    loading.value = true
    try {
      versions.value = await api.createDraft(siteId as string)
      // Set the update key, since the new draft's `updated_at` will be different
      if (versions.value[0]) {
        siteStore.setUpdateKey(versions.value[0].updated_at.toString())
      }
    } catch (e) {
      console.log('Failed to create draft', e)
      error.value = parseApiErrorKey(toApiError(e))
    }
    loading.value = false
  }

  const deleteDraft = async () => {
    error.value = undefined
    const { siteStore } = useSiteSource()
    loading.value = true
    try {
      await api.deleteDraft(siteId as string)
      await listVersions()
      // Set the update key, since the live version's `updated_at` will be different
      if (versions.value[0]) {
        siteStore.setUpdateKey(versions.value[0].updated_at.toString())
      }
      store.version.setActiveVersion(undefined)
      const restored = await siteStore.restore()
      setRestoredSite(restored)
    } catch (e) {
      console.log('Failed to create draft', e)
      error.value = parseApiErrorKey(toApiError(e))
    }
    loading.value = false
  }

  const publishSite = async () => {
    error.value = undefined
    // Update through the platform API so that `published` field is synced
    // Could be optimized by using the site API if the platform/site published states match
    // TODO -- fall back to site API if platform API not available
    const platformApi = usePlatformSiteApi(rootApi)
    loading.value = true
    try {
      await siteStore.save(site.value, {
        immediate: true,
        ignoreUpdateKey: true,
      })
      await platformApi.publishSite(siteId as string, { publish: true })
    } catch (e) {
      console.log('Failed to publish', e)
      error.value = parseApiErrorKey(toApiError(e))
    }
    loading.value = false
  }

  const setVersion = async (version: string | undefined) => {
    store.version.setActiveVersion(version)
    const restored = await siteStore.restore(site.value.content_updated_at)
    setRestoredSite(restored)
  }

  const setActiveVersion = async (version: VersionOption) => {
    if (version === VersionOption.Live) {
      await siteStore.save(site.value, {
        immediate: true,
        ignoreUpdateKey: true,
      })
      await setVersion(versions.value[1]?.id)
    } else {
      await setVersion(undefined)
    }
  }

  return {
    hasVersions,
    versions,
    hasDraft,
    sitePublished,
    activeVersionId: store.version.activeVersionId,
    loading,
    error,
    listVersions,
    enablePreview,
    createDraft,
    deleteDraft,
    publishSite,
    setActiveVersion,
  }
}
