export interface IUpdateRowApiRequest {
  table_name: string
  row_id: number
  new_row: Record<string, string>
}
