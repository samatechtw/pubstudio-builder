import { PSApi } from '@pubstudio/frontend/util-api'
import { IMAGE_API_KEY, IMAGE_API_URL } from '@pubstudio/frontend/util-config'
import {
  ICreatePlatformSiteAssetRequest,
  ICreatePlatformSiteAssetResponse,
  IListPlatformSiteAssetsRequest,
  IListPlatformSiteAssetsResponse,
  IReplacePlatformSiteAssetRequest,
  IReplacePlatformSiteAssetResponse,
  IUpdatePlatformSiteAssetRequest,
  IUpdatePlatformSiteAssetResponse,
  IVerifyPlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { sleep } from '@pubstudio/shared/util-core'
import { RequestParams } from '@sampullman/fetch-api'
import {
  EnumFileFormat,
  ICreateJobApiResponse,
  IGetJobApiResponse,
  IImageJobConfig,
  ProcessJobStatusEnum,
} from '@samatech/image-api-types'

export interface IOptimizationParams extends IImageJobConfig {
  url: string
  file: File
  inputFormat: EnumFileFormat
  outputFormat: EnumFileFormat
  timeout?: number
}

export interface IApiSiteAsset {
  createSiteAsset: (
    data: ICreatePlatformSiteAssetRequest,
  ) => Promise<ICreatePlatformSiteAssetResponse>
  replaceSiteAsset: (
    id: string,
    data: IReplacePlatformSiteAssetRequest,
  ) => Promise<IReplacePlatformSiteAssetResponse>
  verifySiteAsset: (id: string) => Promise<IVerifyPlatformSiteAssetResponse>
  updateSiteAsset: (
    id: string,
    payload: IUpdatePlatformSiteAssetRequest,
  ) => Promise<IUpdatePlatformSiteAssetResponse>
  listSiteAssets: (
    params: IListPlatformSiteAssetsRequest,
  ) => Promise<IListPlatformSiteAssetsResponse>
  deleteSiteAsset: (id: string) => Promise<void>
  uploadFileWithSignedUrl(url: string, file: File): Promise<Response>
  uploadOptimizedFileWithSignedUrl(params: IOptimizationParams): Promise<void>
}

export const useSiteAssetApi = (api: PSApi): IApiSiteAsset => {
  const createSiteAsset = async (
    payload: ICreatePlatformSiteAssetRequest,
  ): Promise<ICreatePlatformSiteAssetResponse> => {
    const { data } = await api.authRequest({
      url: 'site-assets',
      method: 'POST',
      data: payload,
    })
    return data as ICreatePlatformSiteAssetResponse
  }

  const replaceSiteAsset = async (
    id: string,
    payload: IReplacePlatformSiteAssetRequest,
  ): Promise<IReplacePlatformSiteAssetResponse> => {
    const { data } = await api.authRequest({
      url: `site-assets/${id}/actions/replace`,
      method: 'POST',
      data: payload,
    })
    return data as IReplacePlatformSiteAssetResponse
  }

  const verifySiteAsset = async (
    id: string,
  ): Promise<IVerifyPlatformSiteAssetResponse> => {
    const { data } = await api.authRequest({
      url: `site-assets/${id}/actions/verify`,
      method: 'POST',
    })
    return data as IVerifyPlatformSiteAssetResponse
  }
  const updateSiteAsset = async (
    id: string,
    payload: IUpdatePlatformSiteAssetRequest,
  ): Promise<IUpdatePlatformSiteAssetResponse> => {
    const { data } = await api.authRequest({
      url: `site-assets/${id}`,
      method: 'PATCH',
      data: payload,
    })
    return data as IUpdatePlatformSiteAssetResponse
  }

  const listSiteAssets = async (
    params: IListPlatformSiteAssetsRequest,
  ): Promise<IListPlatformSiteAssetsResponse> => {
    const { data } = await api.authRequest({
      url: 'site-assets',
      method: 'GET',
      params: params as RequestParams,
    })
    return data as IListPlatformSiteAssetsResponse
  }

  const deleteSiteAsset = async (id: string): Promise<void> => {
    await api.authRequest({
      url: `site-assets/${id}`,
      method: 'DELETE',
    })
  }

  const uploadFileWithSignedUrl = (url: string, file: File): Promise<Response> => {
    return fetch(url, { method: 'PUT', body: file, mode: 'cors' })
  }

  // TODO -- this can be moved to @samatech/image-api-web-util
  const uploadOptimizedFileWithSignedUrl = async (params: IOptimizationParams) => {
    const { file, url, inputFormat, outputFormat, optimizeAlgo } = params
    const timeout = params.timeout ?? 10000
    const quality = params.quality ?? 85
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploadUrl', url)
    formData.append('inputFormat', inputFormat)
    formData.append('outputFormat', outputFormat)
    formData.append('optimizeAlgo', optimizeAlgo ?? '')
    formData.append('quality', quality.toString())

    const headers = {
      'X-IMAGE-API-KEY': IMAGE_API_KEY,
    }
    const jobResponse = await api.authRequest({
      url: `${IMAGE_API_URL}/jobs`,
      headers,
      ignoreBaseUrl: true,
      method: 'POST',
      data: formData,
    })
    const data = jobResponse.data as unknown as ICreateJobApiResponse
    const jobId = data.jobId
    if (!jobId) {
      throw new Error('Failed to start processing job')
    }
    const startTime = Date.now()
    let time = startTime
    while (time - startTime < timeout) {
      const jobPoll = await api.request({
        url: `${IMAGE_API_URL}/jobs/${jobId}`,
        headers,
        ignoreBaseUrl: true,
      })
      const { status } = jobPoll.data as unknown as IGetJobApiResponse
      if (status === ProcessJobStatusEnum.Fail) {
        throw new Error('Image processing failed')
      } else if (status === ProcessJobStatusEnum.Complete) {
        return
      } else {
        await sleep(1000)
      }
      time = Date.now()
    }
  }

  return {
    createSiteAsset,
    replaceSiteAsset,
    verifySiteAsset,
    updateSiteAsset,
    listSiteAssets,
    deleteSiteAsset,
    uploadFileWithSignedUrl,
    uploadOptimizedFileWithSignedUrl,
  }
}
