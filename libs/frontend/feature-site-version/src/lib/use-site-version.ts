import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { SiteVariant } from '@pubstudio/shared/type-api-platform-site'
import { ISiteInfoViewModel } from '@pubstudio/shared/type-api-site-sites'
import { Ref, ref } from 'vue'

export interface IUseSiteVersion {
  hasVersions: Ref<boolean>
  versions: Ref<ISiteInfoViewModel[]>
  listVersions: (siteId: string | undefined) => Promise<void>
}

export interface IUseSiteVersionOptions {
  serverAddress: string | undefined
}

const versions = ref<ISiteInfoViewModel[]>([])
const hasVersions = ref<boolean>(false)
let serverAddress: string | undefined = undefined

export const useSiteVersion = (options: IUseSiteVersionOptions): IUseSiteVersion => {
  serverAddress = options.serverAddress

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
    listVersions,
  }
}
