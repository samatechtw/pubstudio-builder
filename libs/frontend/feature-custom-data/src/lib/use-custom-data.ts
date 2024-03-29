import { inject } from 'vue'
import { IApiCustomData, useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import {
  IListTablesQuery,
  IListTablesResponse,
  IListRowsQuery,
  IListRowsResponse,
} from '@pubstudio/shared/type-api-site-custom-data'

export interface ICustomDataFeature {
  api: IApiCustomData
  listTables: (
    siteId: string,
    query: IListTablesQuery,
  ) => Promise<IListTablesResponse | undefined>
  listRows: (
    siteId: string,
    query: IListRowsQuery,
  ) => Promise<IListRowsResponse | undefined>
}

export const useCustomData = (): ICustomDataFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useCustomDataApi(rootApi)

  const listTables = async (
    siteId: string,
    query: IListTablesQuery,
  ): Promise<IListTablesResponse | undefined> => {
    try {
      const response = await api.listTables(siteId, query)
      return response
    } catch (e) {
      console.log('List custom data tables error: ', e)
      return undefined
    }
  }

  const listRows = async (
    siteId: string,
    query: IListRowsQuery,
  ): Promise<IListRowsResponse | undefined> => {
    try {
      const response = await api.listRows(siteId, query)
      return response
    } catch (e) {
      console.log('List custom data rows error: ', e)
      return undefined
    }
  }

  return {
    api,
    listTables,
    listRows,
  }
}
