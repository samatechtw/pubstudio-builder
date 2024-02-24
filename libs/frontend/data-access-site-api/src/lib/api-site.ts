import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'
import {
  IGetSiteUsageApiResponse,
  IGetSiteVersionApiRequest,
  IGetSiteVersionApiResponse,
  IListSiteVersionsApiResponse,
  IPublishSiteApiRequest,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { plainResponseInterceptors } from '@pubstudio/shared/util-fetch-api'
import { RequestParams } from '@sampullman/fetch-api'

export interface IUseSiteApiParams {
  serverAddress: string
  store: IFrontendStore
}

export type GetSiteVersionFn = (
  siteId: string,
  versionId: string,
  query?: IGetSiteVersionApiRequest,
) => Promise<IGetSiteVersionApiResponse | undefined>

export interface IApiSite {
  getSiteVersion: GetSiteVersionFn
  listSiteVersions(siteId: string): Promise<IListSiteVersionsApiResponse>
  getSiteUsage(siteId: string): Promise<IGetSiteUsageApiResponse>
  updateSite(
    siteId: string,
    payload: IUpdateSiteApiRequest,
    keepalive?: boolean,
  ): Promise<IUpdateSiteApiResponse>
  createDraft(siteId: string): Promise<IListSiteVersionsApiResponse>
  publishSite(siteId: string, publish: boolean): Promise<void>
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
    responseInterceptors: [...plainResponseInterceptors],
  })

  const getSiteVersion = async (
    siteId: string,
    versionId: string,
    query?: IGetSiteVersionApiRequest,
  ): Promise<IGetSiteVersionApiResponse | undefined> => {
    const res = await api.authRequest({
      url: `sites/${siteId}/versions/${versionId}`,
      method: 'GET',
      params: query as RequestParams | undefined,
    })
    if (res.status === 204) {
      return undefined
    }
    const serialized = res.data as IGetSiteVersionApiResponse
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
      updated_at: serialized.updated_at,
      content_updated_at: serialized.content_updated_at,
    }
  }

  const getSiteUsage = async (siteId: string): Promise<IGetSiteUsageApiResponse> => {
    const { data } = await api.authRequest<IGetSiteUsageApiResponse>({
      url: `sites/${siteId}/usage`,
    })
    return data
  }

  const listSiteVersions = async (
    siteId: string,
  ): Promise<IListSiteVersionsApiResponse> => {
    const res = await api.authOptRequest({
      url: `sites/${siteId}/versions`,
      method: 'GET',
    })
    return res.data as IListSiteVersionsApiResponse
  }

  const createDraft = async (siteId: string): Promise<IListSiteVersionsApiResponse> => {
    const res = await api.authOptRequest({
      url: `sites/${siteId}/actions/create_draft`,
      method: 'POST',
    })
    return res.data as IListSiteVersionsApiResponse
  }

  const publishSite = async (siteId: string, publish: boolean): Promise<void> => {
    const data: IPublishSiteApiRequest = { publish }
    await api.authOptRequest({
      url: `sites/${siteId}/actions/publish`,
      method: 'POST',
      data,
    })
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
    const serialized = data as IGetSiteVersionApiResponse
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
      updated_at: serialized.updated_at,
      content_updated_at: serialized.content_updated_at,
    }
  }

  return {
    updateSite,
    getSiteUsage,
    getSiteVersion,
    listSiteVersions,
    createDraft,
    publishSite,
  }
}
