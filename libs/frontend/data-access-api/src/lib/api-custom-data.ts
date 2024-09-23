import { IApiCustomData, PSApiShim } from '@pubstudio/shared/type-api-interfaces'
import {
  CustomDataAction,
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
} from '@pubstudio/shared/type-api-site-custom-data'

export const useCustomDataApi = (siteId: string): IApiCustomData => {
  const customDataRequest = async <T = unknown>(
    api: PSApiShim | undefined,
    action: CustomDataAction,
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
    return customDataRequest(api, CustomDataAction.ListTables, query)
  }

  const listRows = async (
    api: PSApiShim | undefined,
    query: IListRowsApiQuery,
  ): Promise<IListRowsResponse> => {
    return customDataRequest(api, CustomDataAction.ListRows, query)
  }

  const createTable = async (
    api: PSApiShim | undefined,
    payload: ICreateTableApiRequest,
  ): Promise<ICreateTableResponse> => {
    return customDataRequest(api, CustomDataAction.CreateTable, payload)
  }

  const addRow = async (
    api: PSApiShim | undefined,
    payload: IAddRowApiRequest,
  ): Promise<IAddRowApiResponse> => {
    return customDataRequest(api, CustomDataAction.AddRow, payload)
  }

  const updateRow = async (
    api: PSApiShim | undefined,
    payload: IUpdateRowApiRequest,
  ): Promise<IUpdateRowResponse> => {
    return customDataRequest(api, CustomDataAction.UpdateRow, payload)
  }

  const removeRow = async (
    api: PSApiShim | undefined,
    payload: IRemoveRowApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, CustomDataAction.RemoveRow, payload)
  }

  const addColumn = async (
    api: PSApiShim | undefined,
    payload: IAddColumnApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, CustomDataAction.AddColumn, payload)
  }

  const modifyColumn = async (
    api: PSApiShim | undefined,
    payload: IModifyColumnApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, CustomDataAction.ModifyColumn, payload)
  }

  const deleteTable = async (
    api: PSApiShim | undefined,
    payload: IDeleteTableApiRequest,
  ): Promise<void> => {
    await customDataRequest(api, CustomDataAction.DeleteTable, payload)
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
    deleteTable,
  }
}
