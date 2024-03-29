import { PSApi } from '@pubstudio/frontend/util-api'
import {
  // Action,
  IListTablesApiRequest,
  IListTablesQuery,
  IListTablesResponse,
  IListRowsApiRequest,
  IListRowsQuery,
  IListRowsResponse,
} from '@pubstudio/shared/type-api-site-custom-data'

export interface IApiCustomData {
  listTables: (siteId: string, query: IListTablesQuery) => Promise<IListTablesResponse>
  listRows: (siteId: string, query: IListRowsQuery) => Promise<IListRowsResponse>
}

export const useCustomDataApi = (api: PSApi): IApiCustomData => {
  const listTables = async (
    siteId: string,
    query: IListTablesQuery,
  ): Promise<IListTablesResponse> => {
    const payload: IListTablesApiRequest = {
      // action: Action.ListTables,
      action: 'ListTables' as any,
      data: query,
    }
    const { data } = await api.authRequest({
      url: `sites/${siteId}/custom_data`,
      method: 'POST',
      data: payload,
    })
    return data as IListTablesResponse
  }

  const listRows = async (
    siteId: string,
    query: IListRowsQuery,
  ): Promise<IListRowsResponse> => {
    const payload: IListRowsApiRequest = {
      // action: Action.ListRows,
      action: 'ListRows' as any,
      data: query,
    }
    const { data } = await api.authRequest({
      url: `sites/${siteId}/custom_data`,
      method: 'POST',
      data: payload,
    })
    return data as IListRowsResponse
  }

  return {
    listTables,
    listRows,
  }
}
