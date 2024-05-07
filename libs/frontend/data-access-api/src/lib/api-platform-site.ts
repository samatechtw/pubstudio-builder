import { PSApi } from '@pubstudio/frontend/util-api'
import { IApiPlatformSite } from '@pubstudio/shared/type-api-interfaces'
import {
  ICreatePlatformSiteRequest,
  ICreatePlatformSiteResponse,
  IGetPlatformSiteApiResponse,
  IListPlatformSitesRequest,
  IListPlatformSitesResponse,
  IPublishPlatformSiteRequest,
  IUpdatePlatformSiteApiResponse,
  IUpdatePlatformSiteRequest,
} from '@pubstudio/shared/type-api-platform-site'
import { RequestParams } from '@sampullman/fetch-api'

export const usePlatformSiteApi = (api: PSApi): IApiPlatformSite => {
  const createSite = async (
    payload: ICreatePlatformSiteRequest,
  ): Promise<ICreatePlatformSiteResponse> => {
    const { data } = await api.authRequest({
      url: 'sites',
      method: 'POST',
      data: payload,
    })
    return data as ICreatePlatformSiteResponse
  }

  const updateSite = async (
    id: string,
    payload: IUpdatePlatformSiteRequest,
  ): Promise<IUpdatePlatformSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `sites/${id}`,
      method: 'PATCH',
      data: payload,
    })
    return data as IUpdatePlatformSiteApiResponse
  }

  const publishSite = async (
    id: string,
    payload: IPublishPlatformSiteRequest,
  ): Promise<void> => {
    await api.authRequest({
      url: `sites/${id}/actions/publish`,
      method: 'POST',
      data: payload,
    })
  }

  const listSites = async (
    params: IListPlatformSitesRequest,
  ): Promise<IListPlatformSitesResponse> => {
    const { data } = await api.authRequest({
      url: 'sites',
      method: 'GET',
      params: params as RequestParams,
    })
    return data as IListPlatformSitesResponse
  }

  const getSite = async (siteId: string): Promise<IGetPlatformSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `sites/${siteId}`,
      method: 'GET',
    })
    return data as IGetPlatformSiteApiResponse
  }

  const deleteSite = async (siteId: string): Promise<void> => {
    await api.authRequest({
      url: `sites/${siteId}`,
      method: 'DELETE',
    })
  }

  return {
    createSite,
    updateSite,
    publishSite,
    listSites,
    getSite,
    deleteSite,
  }
}
