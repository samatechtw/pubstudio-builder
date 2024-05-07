import { PSApi } from '@pubstudio/frontend/util-api'
import { IApiLocalSite } from '@pubstudio/shared/type-api-interfaces'
import {
  IGetLocalSiteApiRequest,
  IGetLocalSiteApiResponse,
  IUpdateLocalSiteApiRequest,
  IUpdateLocalSiteApiResponse,
} from '@pubstudio/shared/type-api-local-site'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { RequestParams } from '@sampullman/fetch-api'

export const useLocalSiteApi = (_api: PSApi): IApiLocalSite => {
  // TODO -- this is a workaround to avoid parsing Site updated_at so we can use it
  // in preview mode as the update key. It would be better if the individual request could
  // override the response interceptors
  const api = new PSApi({
    baseUrl: _api.baseUrl,
    userToken: _api.userToken,
    responseInterceptors: [...plainResponseInterceptors],
  })

  const updateLocalSite = async (
    id: string,
    payload: IUpdateLocalSiteApiRequest,
    keepalive?: boolean,
  ): Promise<IUpdateLocalSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `local_sites/${id}`,
      method: 'PATCH',
      data: payload,
      keepalive,
    })
    return data as IUpdateLocalSiteApiResponse
  }

  const getLocalSite = async (
    siteId: string,
    query?: IGetLocalSiteApiRequest,
  ): Promise<IGetLocalSiteApiResponse | undefined> => {
    const res = await api.authRequest({
      url: `local_sites/${siteId}`,
      method: 'GET',
      params: query as RequestParams | undefined,
    })
    if (res.status === 401) {
      throw res
    }
    if (res.status === 204 || res.status >= 400) {
      return undefined
    }
    const serialized = res.data as IGetLocalSiteApiResponse
    return {
      id: serialized.id,
      user_id: serialized.user_id,
      name: serialized.name,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      editor: JSON.parse(serialized.editor),
      history: JSON.parse(serialized.history),
      pages: JSON.parse(serialized.pages),
      published: serialized.published,
      subdomain: serialized.subdomain,
      disabled: serialized.disabled,
      updated_at: serialized.updated_at,
      content_updated_at: serialized.content_updated_at,
      preview_id: serialized.preview_id,
    }
  }

  const getLocalSiteVersion = async (
    siteId: string,
    _versionId: string,
    query?: IGetLocalSiteApiRequest,
  ): Promise<IGetLocalSiteApiResponse | undefined> => {
    return getLocalSite(siteId, query)
  }

  return {
    updateLocalSite,
    getLocalSite,
    getLocalSiteVersion,
  }
}
