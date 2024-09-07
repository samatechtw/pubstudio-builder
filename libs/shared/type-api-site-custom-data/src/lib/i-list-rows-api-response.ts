export interface ICustomTableRow {
  [key: string]: string
}

export interface IListRowsResponse {
  total: number
  results: ICustomTableRow[]
}
