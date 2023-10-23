import { PSApi } from '@pubstudio/frontend/util-api'
import {
  IGetLocalSiteApiResponse,
  IUpdateLocalSiteApiRequest,
  IUpdateLocalSiteApiResponse,
} from '@pubstudio/shared/type-api-local-site'

export interface IApiLocalSite {
  updateLocalSite: (
    id: string,
    data: IUpdateLocalSiteApiRequest,
    keepalive?: boolean,
  ) => Promise<IUpdateLocalSiteApiResponse>
  getLocalSite(siteId: string): Promise<IGetLocalSiteApiResponse>
}

export const useLocalSiteApi = (api: PSApi): IApiLocalSite => {
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

  const getLocalSite = async (siteId: string): Promise<IGetLocalSiteApiResponse> => {
    const { data } = await api.authRequest({
      url: `local_sites/${siteId}`,
      method: 'GET',
    })
    const serialized = data as IGetLocalSiteApiResponse
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
    }
  }

  return {
    updateLocalSite,
    getLocalSite,
  }
}
