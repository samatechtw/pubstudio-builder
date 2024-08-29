import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  IListRowsApiQuery,
  IListRowsResponse,
  IListTablesApiQuery,
  IListTablesResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { ComputedRef } from 'vue'

export interface ICustomDataFeature {
  listTables: (query: IListTablesApiQuery) => Promise<IListTablesResponse | undefined>
  listRows: (query: IListRowsApiQuery) => Promise<IListRowsResponse | undefined>
}

export const useCustomData = (siteId: ComputedRef<string>): ICustomDataFeature => {
  const { apiSite } = useSiteSource()

  const listTables = async (
    query: IListTablesApiQuery,
  ): Promise<IListTablesResponse | undefined> => {
    if (!apiSite) {
      return
    }
    const api = useCustomDataApi(apiSite, siteId.value)
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
    if (!apiSite) {
      return
    }
    const api = useCustomDataApi(apiSite, siteId.value)
    try {
      const response = await api.listRows(query)
      return response
    } catch (e) {
      console.log('List custom data rows error: ', e)
      return undefined
    }
  }

  return {
    listTables,
    listRows,
  }
}
