import { IApiCustomData, PSApiShim } from '@pubstudio/shared/type-api-interfaces'
import {
  CustomDataActionType,
  IAddColumnApiRequest,
  IAddRowApiRequest,
  IAddRowApiResponse,
  ICreateTableApiRequest,
  ICreateTableResponse,
  ICustomDataApiRequest,
  IDeleteTableApiRequest,
  IListRowsApiQuery,
  IListRowsResponse,
  IListTablesApiQuery,
  IListTablesResponse,
  IModifyColumnApiRequest,
  IRemoveRowApiRequest,
  IUpdateRowApiRequest,
  IUpdateRowResponse,
  IUpdateTableApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'

export const useCustomDataApi = (siteId: string): IApiCustomData => {
  const customDataRequest = async <T = unknown>(
    api: PSApiShim | undefined,
    action: CustomDataActionType,
    payload: unknown,
  ): Promise<T> => {
    if (!api) {
      throw 'errors.None'
    }
    const reqPayload: ICustomDataApiRequest = {
      action,
      data: payload,
    }
    const { data } = await api.authRequest<T>({
      url: `sites/${siteId}/custom_data`,
      method: 'POST',
      data: reqPayload,
    })
    return data
  }

  const listTables = async (
    api: PSApiShim | undefined,
    query: IListTablesApiQuery,
  ): Promise<IListTablesResponse> => {
    return customDataRequest(api, 'ListTables', query)
  }

  const listRows = async (
    api: PSApiShim | undefined,
    query: IListRowsApiQuery,
  ): Promise<IListRowsResponse> => {
    return customDataRequest(api, 'ListRows', query)
  }

  const createTable = async (
    api: PSApiShim | undefined,
    payload: ICreateTableApiRequest,
  ): Promise<ICreateTableResponse> => {
    return customDataRequest(api, 'CreateTable', payload)
  }

  const addRow = async (
    api: PSApiShim | undefined,
    payload: IAddRowApiRequest,
  ): Promise<IAddRowApiResponse> => {
    return customDataRequest(api, 'AddRow', payload)
  }

  const updateRow = async (
    api: PSApiShim | undefined,
    payload: IUpdateRowApiRequest,
  ): Promise<IUpdateRowResponse> => {
    return customDataRequest(api, 'UpdateRow', payload)
  }

  const removeRow = async (
    api: PSApiShim | undefined,
    payload: IRemoveRowApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, 'RemoveRow', payload)
  }

  const addColumn = async (
    api: PSApiShim | undefined,
    payload: IAddColumnApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, 'AddColumn', payload)
  }

  const modifyColumn = async (
    api: PSApiShim | undefined,
    payload: IModifyColumnApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, 'ModifyColumn', payload)
  }

  const updateTable = async (
    api: PSApiShim | undefined,
    payload: IUpdateTableApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, 'UpdateTable', payload)
  }

  const deleteTable = async (
    api: PSApiShim | undefined,
    payload: IDeleteTableApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, 'DeleteTable', payload)
  }

  return {
    listRows,
    createTable,
    listTables,
    addRow,
    updateRow,
    removeRow,
    addColumn,
    modifyColumn,
    updateTable,
    deleteTable,
  }
}
