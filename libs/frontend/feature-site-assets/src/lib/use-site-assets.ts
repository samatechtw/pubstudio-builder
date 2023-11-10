import { IApiSiteAsset, useSiteAssetApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import {
  ICreatePlatformSiteAssetRequest,
  IListPlatformSiteAssetsRequest,
  IReplacePlatformSiteAssetRequest,
  ISiteAssetViewModel,
  IUpdatePlatformSiteAssetRequest,
  IVerifyPlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { inject, Ref, ref } from 'vue'
import { IUploadFileResult, useAssets } from './upload-asset'

export interface ISiteAssetListItem extends ISiteAssetViewModel {
  version: number
}

export interface ISiteAssetsFeature {
  api: IApiSiteAsset
  assets: Ref<ISiteAssetListItem[] | undefined>
  loading: Ref<boolean>
  usage: Ref<number | undefined>
  updateKey: Ref<number>
  createAsset: (
    data: ICreatePlatformSiteAssetRequest,
    file: File,
  ) => Promise<IUploadFileResult>
  replaceAsset: (
    id: string,
    data: IReplacePlatformSiteAssetRequest,
    file: File,
  ) => Promise<IUploadFileResult>
  updateAsset: (
    id: string,
    payload: IUpdatePlatformSiteAssetRequest,
  ) => Promise<ISiteAssetListItem | undefined>
  verifyAsset: (id: string) => Promise<IVerifyPlatformSiteAssetResponse>
  listAssets: (params: IListPlatformSiteAssetsRequest) => Promise<void>
  updateAssetList: (newAsset: ISiteAssetListItem) => void
  deleteAsset: (id: string) => Promise<void>
}

const assets = ref<ISiteAssetListItem[]>()
const updateKey = ref(0)

export const useSiteAssets = (): ISiteAssetsFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useSiteAssetApi(rootApi)
  const { uploadFileAndGetUrl, replaceFileAndGetUrl } = useAssets()
  const loading = ref(false)
  const usage = ref()

  const createAsset = async (
    data: ICreatePlatformSiteAssetRequest,
    file: File,
  ): Promise<IUploadFileResult> => {
    const result = await uploadFileAndGetUrl(data, file)
    return result
  }

  const replaceAsset = async (
    id: string,
    data: IReplacePlatformSiteAssetRequest,
    file: File,
  ): Promise<IUploadFileResult> => {
    return await replaceFileAndGetUrl(id, data, file)
  }

  const verifyAsset = async (id: string): Promise<IVerifyPlatformSiteAssetResponse> => {
    const result = await api.verifySiteAsset(id)
    updateKey.value += 1
    return result
  }

  const updateAsset = async (
    id: string,
    payload: IUpdatePlatformSiteAssetRequest,
  ): Promise<ISiteAssetListItem | undefined> => {
    loading.value = true
    try {
      const updated = await api.updateSiteAsset(id, payload)
      return { ...updated, version: 1 }
    } catch (e) {
      console.log('Update site asset error', e)
    } finally {
      loading.value = false
    }
  }

  const listAssets = async (params: IListPlatformSiteAssetsRequest): Promise<void> => {
    loading.value = true
    try {
      const response = await api.listSiteAssets(params)
      usage.value = response.total_usage
      assets.value = response.results.map((asset) => ({ ...asset, version: 1 }))
    } catch (e) {
      console.log('List site assets failed', e)
    }
    loading.value = false
  }

  const updateAssetList = (newAsset: ISiteAssetListItem) => {
    if (!assets.value) {
      return
    }
    for (let i = 0; i < assets.value.length; i += 1) {
      if (assets.value[i].id === newAsset.id) {
        assets.value[i] = newAsset
      }
    }
  }

  const deleteAsset = async (id: string): Promise<void> => {
    await api.deleteSiteAsset(id)
  }

  return {
    api,
    assets,
    loading,
    usage,
    updateKey,
    createAsset,
    replaceAsset,
    verifyAsset,
    updateAsset,
    listAssets,
    updateAssetList,
    deleteAsset,
  }
}
