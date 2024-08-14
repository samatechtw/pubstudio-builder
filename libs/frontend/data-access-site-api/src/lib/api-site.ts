import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'
import { IApiError } from '@pubstudio/shared/type-api'
import {
  IGetSiteUsageApiResponse,
  IGetSiteVersionApiRequest,
  IGetSiteVersionApiResponse,
  IListSiteVersionsApiResponse,
  IPublishSiteApiRequest,
  ISiteMetadata,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
  IUpdateSiteMetadataApiRequest,
} from '@pubstudio/shared/type-api-site-sites'
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
  getSiteMetadata(siteId: string): Promise<ISiteMetadata>
  updateSiteMetadata(
    siteId: string,
    payload: IUpdateSiteMetadataApiRequest,
  ): Promise<void>
  updateSite(
    siteId: string,
    payload: IUpdateSiteApiRequest,
    keepalive?: boolean,
  ): Promise<IUpdateSiteApiResponse>
  createDraft(siteId: string): Promise<IListSiteVersionsApiResponse>
  deleteDraft(siteId: string): Promise<void>
  publishSite(siteId: string, publish: boolean): Promise<void>
}

export const useSiteApi = (api: PSApi): IApiSite => {
  const getSiteVersion = async (
    siteId: string,
    versionId: string,
    query?: IGetSiteVersionApiRequest,
  ): Promise<IGetSiteVersionApiResponse | undefined> => {
    const res = await api.authRequest<IGetSiteVersionApiResponse | IApiError>({
      url: `sites/${siteId}/versions/${versionId}`,
      method: 'GET',
      params: query as RequestParams | undefined,
    })
    if (res.status === 204) {
      return undefined
    }
    const serialized = res.data as IGetSiteVersionApiResponse
    if ('status' in res.data) {
      throw res.data
    } else {
      return {
        id: serialized.id,
        name: serialized.name,
        version: serialized.version,
        context: JSON.parse(serialized.context),
        defaults: JSON.parse(serialized.defaults),
        editor: serialized.editor ? JSON.parse(serialized.editor) : undefined,
        history: serialized.history ? JSON.parse(serialized.history) : undefined,
        pages: JSON.parse(serialized.pages),
        pageOrder: serialized.pageOrder ? JSON.parse(serialized.pageOrder) : undefined,
        published: serialized.published,
        disabled: serialized.disabled,
        updated_at: serialized.updated_at,
        content_updated_at: serialized.content_updated_at,
        preview_id: serialized.preview_id,
      }
    }
  }

  const getSiteUsage = async (siteId: string): Promise<IGetSiteUsageApiResponse> => {
    const { data } = await api.authRequest<IGetSiteUsageApiResponse>({
      url: `sites/${siteId}/usage`,
    })
    return data
  }

  const getSiteMetadata = async (siteId: string): Promise<ISiteMetadata> => {
    const { data } = await api.authRequest<ISiteMetadata>({
      url: `sites_metadata/${siteId}`,
    })
    return data
  }

  const updateSiteMetadata = async (
    siteId: string,
    payload: IUpdateSiteMetadataApiRequest,
  ) => {
    await api.authRequest({
      url: `sites_metadata/${siteId}`,
      method: 'PATCH',
      data: payload,
    })
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

  const deleteDraft = async (siteId: string): Promise<void> => {
    await api.authOptRequest({
      url: `sites/${siteId}/actions/delete_draft`,
      method: 'DELETE',
    })
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
    const rsp = await api.authRequest<IGetSiteVersionApiResponse | IApiError>({
      url: `sites/${siteId}`,
      method: 'PATCH',
      data: payload,
      keepalive,
    })
    const serialized = rsp.data as IGetSiteVersionApiResponse
    if ('status' in rsp.data) {
      throw rsp.data
    } else {
      return {
        id: serialized.id,
        name: serialized.name,
        version: serialized.version,
        context: JSON.parse(serialized.context),
        defaults: JSON.parse(serialized.defaults),
        editor: serialized.editor ? JSON.parse(serialized.editor) : undefined,
        history: serialized.history ? JSON.parse(serialized.history) : undefined,
        pages: JSON.parse(serialized.pages),
        pageOrder: serialized.pageOrder ? JSON.parse(serialized.pageOrder) : undefined,
        disabled: serialized.disabled,
        published: serialized.published,
        updated_at: serialized.updated_at,
        content_updated_at: serialized.content_updated_at,
        preview_id: serialized.preview_id,
      }
    }
  }

  return {
    updateSite,
    getSiteUsage,
    getSiteMetadata,
    updateSiteMetadata,
    getSiteVersion,
    listSiteVersions,
    createDraft,
    deleteDraft,
    publishSite,
  }
}
