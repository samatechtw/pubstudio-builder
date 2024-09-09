export interface IAddRowApiRequest {
  table_name: string
  row: Record<string, string | undefined>
}
