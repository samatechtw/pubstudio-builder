import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'

interface IMakeColumnInfo extends Partial<ICustomTableColumn> {
  name: string
}

export const makeColumnInfo = (info: IMakeColumnInfo): ICustomTableColumn => {
  return {
    name: info.name,
    default: info.default ?? '',
    data_type: info.data_type ?? 'TEXT',
    validation_rules: info.validation_rules ?? [],
  }
}
