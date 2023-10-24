import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'
import {
  IGetSiteApiResponse,
  IGetSiteUsageApiResponse,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'

export interface IUseSiteApiParams {
  serverAddress: string
  store: IFrontendStore
}

export interface IApiSite {
  getSite(siteId: string): Promise<IGetSiteApiResponse>
  getSiteUsage(siteId: string): Promise<IGetSiteUsageApiResponse>
  updateSite(
    siteId: string,
    payload: IUpdateSiteApiRequest,
    keepalive?: boolean,
  ): Promise<IUpdateSiteApiResponse>
}

export const useSiteApi = (params: IUseSiteApiParams): IApiSite => {
  const { store, serverAddress } = params

  // Convert cluster URLs for dev/CI
  const address =
    {
      'http://site-api1:3100': 'http://127.0.0.1:3100',
      'http://site-api1:3110': 'http://127.0.0.1:3110',
    }[serverAddress] ?? serverAddress

  const api = new PSApi({
    baseUrl: `${address}/api/`,
    userToken: store.auth.token,
  })

  const getSite = async (siteId: string): Promise<IGetSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `sites/${siteId}`,
      method: 'GET',
    })
    const serialized = data as IGetSiteApiResponse
    return {
      id: serialized.id,
      name: serialized.name,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      editor: serialized.editor ? JSON.parse(serialized.editor) : undefined,
      history: serialized.history ? JSON.parse(serialized.history) : undefined,
      pages: JSON.parse(serialized.pages),
      published: serialized.published,
      disabled: serialized.disabled,
    }
  }

  const getSiteUsage = async (siteId: string): Promise<IGetSiteUsageApiResponse> => {
    const { data } = await api.authRequest<IGetSiteUsageApiResponse>({
      url: `sites/${siteId}/usage`,
    })
    return data
  }

  const updateSite = async (
    siteId: string,
    payload: IUpdateSiteApiRequest,
    keepalive?: boolean,
  ): Promise<IUpdateSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `sites/${siteId}`,
      method: 'PATCH',
      data: payload,
      keepalive,
    })
    const serialized = data as IGetSiteApiResponse
    return {
      id: serialized.id,
      name: serialized.name,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      editor: serialized.editor ? JSON.parse(serialized.editor) : undefined,
      history: serialized.history ? JSON.parse(serialized.history) : undefined,
      pages: JSON.parse(serialized.pages),
      disabled: serialized.disabled,
      published: serialized.published,
    }
  }

  return {
    updateSite,
    getSiteUsage,
    getSite,
  }
}
