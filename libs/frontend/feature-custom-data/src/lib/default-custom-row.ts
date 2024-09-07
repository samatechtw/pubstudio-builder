import {
  ICustomTableColumn,
  ICustomTableRow,
} from '@pubstudio/shared/type-api-site-custom-data'

export const defaultCustomRow = (columns: ICustomTableColumn[]): ICustomTableRow => {
  const row: ICustomTableRow = {}
  for (const col of columns) {
    row[col.name] = ''
  }
  return row
}
