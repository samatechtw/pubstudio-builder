import { PSApi } from '@pubstudio/frontend/util-api'
import { IApiCustomData } from '@pubstudio/shared/type-api-interfaces'
import {
  CustomDataAction,
  ICreateTableApiRequest,
  ICreateTableResponse,
  ICustomDataApiRequest,
  IListTablesApiQuery,
  IListTablesResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { RequestParams } from '@sampullman/fetch-api'

export const useCustomDataApi = (api: PSApi, siteId: string): IApiCustomData => {
  const listTables = async (query: IListTablesApiQuery): Promise<IListTablesResponse> => {
    const requestPayload: ICustomDataApiRequest = {
      action: CustomDataAction.ListTables,
      data: query,
    }
    const { data } = await api.authOptRequest({
      url: `sites/${siteId}/custom_data`,
      method: 'POST',
      data: requestPayload as unknown as RequestParams,
    })
    return data as IListTablesResponse
  }

  const createTable = async (
    payload: ICreateTableApiRequest,
  ): Promise<ICreateTableResponse> => {
    const requestPayload: ICustomDataApiRequest = {
      action: CustomDataAction.CreateTable,
      data: payload,
    }
    const { data } = await api.authRequest({
      url: `sites/${siteId}/custom_data`,
      method: 'POST',
      data: requestPayload,
    })
    return data as ICreateTableResponse
  }

  return {
    createTable,
    listTables,
  }
}
