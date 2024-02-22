import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { SiteVariant } from '@pubstudio/shared/type-api-platform-site'
import { ISiteInfoViewModel } from '@pubstudio/shared/type-api-site-sites'
import { computed, ComputedRef, Ref, ref } from 'vue'

export interface IUseSiteVersion {
  hasVersions: Ref<boolean>
  versions: Ref<ISiteInfoViewModel[]>
  hasDraft: ComputedRef<boolean>
  sitePublished: ComputedRef<boolean>
  activeVersionId: Ref<string | undefined>
  listVersions: (siteId: string | undefined) => Promise<void>
}

export interface IUseSiteVersionOptions {
  serverAddress: string | undefined
}

const versions = ref<ISiteInfoViewModel[]>([])
const hasVersions = ref<boolean>(false)
// Only set when viewing the live version
const activeVersionId = ref<string | undefined>()
let serverAddress: string | undefined = undefined

const hasDraft = computed(() => {
  return hasVersions.value && versions.value.length > 1 && !versions.value[0]?.published
})

const sitePublished = computed(() => {
  return versions.value.some((v) => v.published)
})

export const useSiteVersion = (options?: IUseSiteVersionOptions): IUseSiteVersion => {
  if (options) {
    serverAddress = options.serverAddress
  }

  const listVersions = async (siteId: string | undefined) => {
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

  return {
    hasVersions,
    versions,
    hasDraft,
    sitePublished,
    activeVersionId,
    listVersions,
  }
}
