import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { site } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { SiteVariant } from '@pubstudio/shared/type-api-platform-site'
import { ISiteInfoViewModel } from '@pubstudio/shared/type-api-site-sites'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { VersionOption } from './enum-version-option'

export interface IUseSiteVersion {
  hasVersions: Ref<boolean>
  versions: Ref<ISiteInfoViewModel[]>
  hasDraft: ComputedRef<boolean>
  sitePublished: ComputedRef<boolean>
  activeVersionId: Ref<string | null | undefined>
  loading: Ref<boolean>
  listVersions: () => Promise<void>
  enablePreview: (enable: boolean) => Promise<void>
  createDraft: () => Promise<void>
  publishSite: () => Promise<void>
  setActiveVersion: (version: VersionOption) => Promise<void>
}

export interface IUseSiteVersionOptions {
  serverAddress: string | undefined
  siteId: string | undefined
}

const versions = ref<ISiteInfoViewModel[]>([])
const hasVersions = ref<boolean>(false)
let serverAddress: string | undefined = undefined
let siteId: string | undefined = undefined

const hasDraft = computed(() => {
  return hasVersions.value && versions.value.length > 1 && !versions.value[0]?.published
})

const sitePublished = computed(() => {
  return versions.value.some((v) => v.published)
})

export const useSiteVersion = (options?: IUseSiteVersionOptions): IUseSiteVersion => {
  const { siteStore, setRestoredSite } = useSiteSource()
  if (options) {
    serverAddress = options.serverAddress
    siteId = options.siteId
  }
  const loading = ref(false)

  const listVersions = async () => {
    hasVersions.value =
      !!serverAddress && !(siteId === SiteVariant.Local || siteId === SiteVariant.Scratch)
    if (hasVersions.value) {
      const { listSiteVersions } = useSiteApi({
        store,
        serverAddress: serverAddress as string,
      })
      try {
        versions.value = await listSiteVersions(siteId as string)
      } catch (e) {
        console.log('Failed to list site versions', e)
      }
    }
  }

  const enablePreview = async (enable: boolean) => {
    const { updateSite } = useSiteApi({
      store,
      serverAddress: serverAddress as string,
    })
    loading.value = true
    try {
      const res = await updateSite(siteId as string, { enable_preview: enable })
      site.value.preview_id = res.preview_id
      siteStore.value.setUpdateKey(res.updated_at.toString())
    } catch (e) {
      console.log(`Failed to set preview ${enable}`, e)
    }
    loading.value = false
  }

  const createDraft = async () => {
    const { siteStore } = useSiteSource()
    const { createDraft } = useSiteApi({
      store,
      serverAddress: serverAddress as string,
    })
    loading.value = true
    try {
      versions.value = await createDraft(siteId as string)
      // Set the update key, since the new draft's `updated_at` will be different
      if (versions.value[0]) {
        siteStore.value.setUpdateKey(versions.value[0].updated_at.toString())
      }
    } catch (e) {
      console.log('Failed to create draft', e)
    }
    loading.value = false
  }

  const publishSite = async () => {
    const { publishSite } = useSiteApi({
      store,
      serverAddress: serverAddress as string,
    })
    loading.value = true
    try {
      await siteStore.value.save(site.value, {
        immediate: true,
        ignoreUpdateKey: true,
      })
      await publishSite(siteId as string, true)
    } catch (e) {
      console.log('Failed to publish')
    }
    loading.value = false
  }

  const setVersion = async (version: string | undefined) => {
    store.version.setActiveVersion(version)
    const restored = await siteStore.value.restore(site.value.content_updated_at)
    setRestoredSite(restored)
  }

  const setActiveVersion = async (version: VersionOption) => {
    if (version === VersionOption.Live) {
      await siteStore.value.save(site.value, {
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
    listVersions,
    enablePreview,
    createDraft,
    publishSite,
    setActiveVersion,
  }
}
