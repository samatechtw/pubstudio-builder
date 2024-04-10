import { IListRowsApiQuery } from '@pubstudio/shared/type-api-site-custom-data'

export const mockListRowsPayload = (
  tableName: string,
  from?: number,
  to?: number,
): IListRowsApiQuery => {
  return {
    table_name: tableName,
    from: from || 1,
    to: to || 10,
  }
}
