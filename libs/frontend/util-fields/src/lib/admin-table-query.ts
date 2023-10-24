import { IAdminTableQueryCommon } from './i-admin-table'

export interface IPageToTableQueryParams {
  page: number
  pageSize: number
}

export const pageToTableQuery = (
  params: IPageToTableQueryParams,
): IAdminTableQueryCommon => {
  const offset = (params.page - 1) * params.pageSize
  const from = offset + 1
  const to = offset + params.pageSize
  return { from, to }
}
