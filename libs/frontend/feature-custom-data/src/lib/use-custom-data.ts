import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import { IApiCustomData } from '@pubstudio/shared/type-api-interfaces'
import {
  IListRowsApiQuery,
  IListRowsResponse,
  IListTablesApiQuery,
  IListTablesResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { inject } from 'vue'

export interface ICustomDataFeature {
  api: IApiCustomData
  listTables: (query: IListTablesApiQuery) => Promise<IListTablesResponse | undefined>
  listRows: (query: IListRowsApiQuery) => Promise<IListRowsResponse | undefined>
}

export const useCustomData = (siteId: string): ICustomDataFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useCustomDataApi(rootApi, siteId)

  const listTables = async (
    query: IListTablesApiQuery,
  ): Promise<IListTablesResponse | undefined> => {
    try {
      const response = await api.listTables(query)
      return response
    } catch (e) {
      console.log('List custom data tables error: ', e)
      return undefined
    }
  }

  const listRows = async (
    query: IListRowsApiQuery,
  ): Promise<IListRowsResponse | undefined> => {
    try {
      const response = await api.listRows(query)
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
