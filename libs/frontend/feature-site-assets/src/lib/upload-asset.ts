import { useSiteAssetApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { IAdminAsset } from '@pubstudio/frontend/util-fields'
import { typeFromFile, ValidatedFile } from '@pubstudio/frontend/util-validate'
import {
  ICreatePlatformSiteAssetRequest,
  ICreatePlatformSiteAssetResponse,
  IReplacePlatformSiteAssetRequest,
  IReplacePlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { inject } from 'vue'
import { EnumFileFormat, EnumOptimizationAlgorithm } from '@samatech/image-api-types'

export interface IUploadFileResult extends ICreatePlatformSiteAssetResponse {
  url: string
}

export interface IAssetsFeature {
  getAssetUrl: (
    payload: ICreatePlatformSiteAssetRequest,
    asset: IAdminAsset,
  ) => Promise<string>
  uploadFileAndGetUrl: (
    payload: ICreatePlatformSiteAssetRequest,
    file: File,
  ) => Promise<IUploadFileResult>
  replaceFileAndGetUrl: (
    id: string,
    payload: IReplacePlatformSiteAssetRequest,
    file: File,
  ) => Promise<IUploadFileResult>
  getOptimizedAssetUrl: (
    payload: ICreatePlatformSiteAssetRequest,
    asset: IAdminAsset,
  ) => Promise<string>
  optimizeImage: (
    payload: ICreatePlatformSiteAssetRequest,
    validatedFile: ValidatedFile | undefined,
  ) => Promise<string | undefined>
}

export const useAssets = (): IAssetsFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const apiAsset = useSiteAssetApi(rootApi)

  const getSignedUrl = async (
    payload: ICreatePlatformSiteAssetRequest,
  ): Promise<ICreatePlatformSiteAssetResponse> => {
    const response = await apiAsset.createSiteAsset(payload)
    return response
  }

  const getReplaceSignedUrl = async (
    id: string,
    payload: IReplacePlatformSiteAssetRequest,
  ): Promise<IReplacePlatformSiteAssetResponse> => {
    const response = await apiAsset.replaceSiteAsset(id, payload)
    return response
  }

  const getAssetUrl = async (
    payload: ICreatePlatformSiteAssetRequest,
    asset: IAdminAsset,
  ) => {
    if (asset.file) {
      const result = await uploadFileAndGetUrl(payload, asset.file?.file)
      asset.url = result.url
    }
    return asset.url || asset.input
  }

  const optimizeImage = async (
    payload: ICreatePlatformSiteAssetRequest,
    validatedFile: ValidatedFile | undefined,
  ): Promise<string | undefined> => {
    const file = validatedFile?.file
    if (!validatedFile || !file) {
      return undefined
    }
    const response = await getSignedUrl(payload)
    const url = response.signed_url
    const fileType = typeFromFile(file)
    if (fileType) {
      try {
        const isPng = fileType === EnumFileFormat.png
        await apiAsset.uploadOptimizedFileWithSignedUrl({
          url,
          file,
          inputFormat: fileType,
          // Convert everything except PNG to JPG
          outputFormat: isPng ? fileType : EnumFileFormat.jpg,
          optimizeAlgo: isPng
            ? EnumOptimizationAlgorithm.pngquant
            : EnumOptimizationAlgorithm.mozjpeg,
        })
      } catch (e) {
        console.log(`Failed to upload optimized ${file.name}`, e)
        // Upload directly if optimization fails
        await apiAsset.uploadFileWithSignedUrl(url, file)
      }
    } else {
      await apiAsset.uploadFileWithSignedUrl(url, file)
    }
    return url?.split('?')[0]
  }

  const getOptimizedAssetUrl = async (
    payload: ICreatePlatformSiteAssetRequest,
    asset: IAdminAsset,
  ): Promise<string> => {
    const validatedFile = asset.file
    if (validatedFile) {
      asset.url = await optimizeImage(payload, validatedFile)
    }
    return asset.url || asset.input
  }

  const uploadFileAndGetUrl = async (
    payload: ICreatePlatformSiteAssetRequest,
    file: File,
  ): Promise<IUploadFileResult> => {
    const response = await getSignedUrl(payload)
    const url = response.signed_url
    await apiAsset.uploadFileWithSignedUrl(url, file)
    return { ...response, url: urlFromAsset(response) }
  }

  const replaceFileAndGetUrl = async (
    id: string,
    payload: IReplacePlatformSiteAssetRequest,
    file: File,
  ): Promise<IUploadFileResult> => {
    const response = await getReplaceSignedUrl(id, payload)
    const url = response.signed_url
    await apiAsset.uploadFileWithSignedUrl(url, file)
    return { ...response, url: urlFromAsset(response) }
  }

  return {
    getAssetUrl,
    uploadFileAndGetUrl,
    replaceFileAndGetUrl,
    getOptimizedAssetUrl,
    optimizeImage,
  }
}
